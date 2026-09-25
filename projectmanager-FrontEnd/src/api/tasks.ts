import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { Task, TaskPriority, TaskStatus } from '../lib/types'

export type TaskFilters = {
  search?: string
  status?: TaskStatus
  priority?: TaskPriority
  projectIds?: number[]
  signedTo?: number[]
  take?: number
  skip?: number
}

export type TaskInput = {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  /** YYYY-MM-DD */
  dueDate: string
}

export function useTasks(filters: TaskFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => api.get<Task[]>('/task', filters),
    enabled,
  })
}

function useRefreshAll() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries()
}

export function useCreateTask(projectId: number) {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (input: TaskInput & { signedTo: number[] }) => api.post<Task>('/task', { projectId, ...input }),
    onSuccess: refresh,
  })
}

/** Edita os dados da tarefa e sincroniza os responsáveis (o back-end usa rotas separadas para isso). */
export function useUpdateTask(task: Task) {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: async (input: Partial<TaskInput> & { signedTo?: number[] }) => {
      const { signedTo, ...data } = input

      if (Object.keys(data).length > 0) {
        await api.patch(`/task/${task.id}`, data)
      }

      if (signedTo) {
        const current = task.signedTo.map((member) => member.userId)
        const toAdd = signedTo.filter((id) => !current.includes(id))
        const toRemove = current.filter((id) => !signedTo.includes(id))

        if (toAdd.length > 0) await api.post(`/task/sign-member/${task.id}`, { membersIds: toAdd })
        if (toRemove.length > 0) await api.delete(`/task/unsigned-member/${task.id}`, { membersIds: toRemove })
      }
    },
    onSuccess: refresh,
  })
}

export function useDeleteTask() {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (taskId: number) => api.delete(`/task/${taskId}`),
    onSuccess: refresh,
  })
}
