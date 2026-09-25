import type { ProjectRole, TaskPriority, TaskStatus } from './types'

export const statusLabel: Record<TaskStatus, string> = {
  TODO: 'A fazer',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluída',
}

export const priorityLabel: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
}

export const priorityBadge: Record<TaskPriority, string> = {
  LOW: 'badge-success',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-error',
}

export const roleLabel: Record<ProjectRole, string> = {
  OWNER: 'Dono',
  ADMIN: 'Admin',
  MEMBER: 'Membro',
}

export const roleBadge: Record<ProjectRole, string> = {
  OWNER: 'badge-primary',
  ADMIN: 'badge-warning',
  MEMBER: 'badge-gray',
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

/** Valor para <input type="date"> (YYYY-MM-DD) */
export function toDateInput(iso: string) {
  return iso.slice(0, 10)
}

export function isOverdue(iso: string, status: TaskStatus) {
  return status !== 'DONE' && new Date(iso).getTime() < Date.now() - 24 * 60 * 60 * 1000
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
