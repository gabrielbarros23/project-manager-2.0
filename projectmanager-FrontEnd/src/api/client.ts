/**
 * Cliente HTTP fino sobre fetch. Todas as chamadas vão para /api, que o Vite (dev)
 * ou o proxy reverso (produção) encaminha ao back-end. Assim o cookie httpOnly com o
 * JWT trafega no mesmo origin, sem CORS.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Params = Record<string, string | number | (string | number)[] | undefined>

function buildUrl(path: string, params?: Params) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === '') continue
    for (const item of Array.isArray(value) ? value : [value]) query.append(key, String(item))
  }
  const qs = query.toString()
  return `${BASE_URL}${path}${qs ? `?${qs}` : ''}`
}

/** O back-end devolve `message` como string, lista (class-validator) ou objeto do Nest. */
function extractMessage(payload: unknown): string {
  if (typeof payload === 'string') return payload
  if (Array.isArray(payload)) return payload.map(extractMessage).join('. ')
  if (payload && typeof payload === 'object' && 'message' in payload) {
    return extractMessage((payload as { message: unknown }).message)
  }
  return 'Algo deu errado. Tente novamente.'
}

async function request<T>(method: string, path: string, options: { body?: unknown; params?: Params } = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.params), {
    method,
    credentials: 'include',
    headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  const payload = text ? safeParse(text) : null

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(payload))
  }

  return payload as T
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  get: <T>(path: string, params?: Params) => request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, { body }),
}
