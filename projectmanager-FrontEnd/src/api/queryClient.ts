import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'

export const ME_KEY = ['me'] as const

/** Sessão expirada (o JWT dura 5 min): zera o usuário e o ProtectedRoute manda para /login. */
function handleUnauthorized(error: unknown) {
  if (error instanceof ApiError && error.status === 401 && queryClient.getQueryData(ME_KEY)) {
    queryClient.clear()
    queryClient.setQueryData(ME_KEY, null)
  }
}

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({ onError: handleUnauthorized }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
})
