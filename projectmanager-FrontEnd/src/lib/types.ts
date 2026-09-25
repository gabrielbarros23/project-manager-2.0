export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type User = {
  id: number
  name: string
  email: string
}

export type ProjectMember = {
  userId: number
  projectId: number
  role: ProjectRole
  user: User
}

export type Task = {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  projectId: number
  signedTo: { userId: number; taskId: number }[]
  createdAt: string
  updatedAt: string
}

type ProjectBase = {
  id: number
  title: string
  description: string
  members: ProjectMember[]
  createdAt: string
  updatedAt: string
}

/** Item das listagens (GET /project): só traz id e status das tarefas. */
export type ProjectSummary = ProjectBase & {
  tasks: Pick<Task, 'id' | 'status'>[]
}

/** GET /project/:id */
export type ProjectDetail = ProjectBase & {
  tasks: Task[]
}
