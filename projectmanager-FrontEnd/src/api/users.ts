import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { User } from '../lib/types'

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/user'),
    enabled,
  })
}
