import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './client'
import type { ProjectDetail, ProjectRole, ProjectSummary } from '../lib/types'

export type ProjectSearch = { search?: string; roleFilter?: ProjectRole; take?: number; skip?: number }
export type ProjectInput = { title: string; description: string }

export function useProjects(search: ProjectSearch = {}) {
  return useQuery({
    queryKey: ['projects', search],
    queryFn: () => api.get<ProjectSummary[]>('/project', search),
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get<ProjectDetail>(`/project/${id}`),
  })
}

/** Toda mutação pode alterar listas e contadores em várias telas; invalidar tudo é simples e suficiente aqui. */
function useRefreshAll() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries()
}

/** update/delete do projeto devolvem { count }: 0 significa que o usuário não tem permissão. */
function assertAffected(result: { count: number }) {
  if (result.count === 0) throw new ApiError(403, 'Você não tem permissão para fazer isso.')
  return result
}

export function useCreateProject() {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (input: ProjectInput) => api.post<{ id: number }>('/project', input),
    onSuccess: refresh,
  })
}

export function useUpdateProject(projectId: number) {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: async (input: Partial<ProjectInput>) =>
      assertAffected(await api.patch<{ count: number }>(`/project/${projectId}`, input)),
    onSuccess: refresh,
  })
}

export function useDeleteProject(projectId: number) {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: async () => assertAffected(await api.delete<{ count: number }>(`/project/${projectId}`)),
    onSuccess: refresh,
  })
}

export function useAddMember(projectId: number) {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (input: { memberId: number; role: ProjectRole }) =>
      api.post('/project/add-member', { projectId, ...input }),
    onSuccess: refresh,
  })
}

export function useChangeRole(projectId: number) {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (input: { memberId: number; role: ProjectRole }) =>
      api.put('/project/change-role', { projectId, ...input }),
    onSuccess: refresh,
  })
}

export function useRemoveMember(projectId: number) {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (memberId: number) => api.delete('/project/removeMember', { projectId, memberId }),
    onSuccess: refresh,
  })
}
