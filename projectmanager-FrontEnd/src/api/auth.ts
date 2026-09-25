import { useMutation, useQuery } from '@tanstack/react-query'
import { api, ApiError } from './client'
import { ME_KEY, queryClient } from './queryClient'
import type { User } from '../lib/types'

export type SignUpInput = { name: string; email: string; password: string }
export type LoginInput = { email: string; password: string }

/** Usuário logado, ou null se não houver sessão válida. */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        return await api.get<User>('/auth/me')
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    staleTime: Infinity,
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      await api.post('/auth', input)
      return api.get<User>('/auth/me')
    },
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      await api.post('/user', input)
      await api.post('/auth', { email: input.email, password: input.password })
      return api.get<User>('/auth/me')
    },
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(ME_KEY, null)
    },
  })
}

/** Só para telas dentro do AppLayout, que já garante que existe um usuário logado. */
export function useCurrentUser() {
  return useMe().data as User
}
