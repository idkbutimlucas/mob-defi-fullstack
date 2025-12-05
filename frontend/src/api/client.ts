const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost/api/v1'

// Token storage
let authToken: string | null = null

export interface Station {
  id: string
  name: string
}

export interface RouteRequest {
  fromStationId: string
  toStationId: string
  analyticCode: string
}

export interface RouteResponse {
  id: string
  fromStationId: string
  toStationId: string
  analyticCode: string
  distanceKm: number
  path: string[]
  segmentDistances: number[]
  createdAt: string
}

export interface ApiError {
  message: string
  code?: string
}

export interface LoginResponse {
  token: string
}

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  requiresAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (requiresAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || `HTTP error ${response.status}`)
  }

  return response.json()
}

export async function login(username: string, password: string): Promise<string> {
  const response = await fetchApi<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  authToken = response.token
  return response.token
}

export async function getStations(): Promise<Station[]> {
  return fetchApi<Station[]>('/stations')
}

export async function calculateRoute(request: RouteRequest): Promise<RouteResponse> {
  return fetchApi<RouteResponse>(
    '/routes',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true
  )
}

export type GroupBy = 'none' | 'day' | 'month' | 'year'

export interface StatsRequest {
  from?: string
  to?: string
  groupBy?: GroupBy
}

export interface DistanceAggregate {
  analyticCode: string
  totalDistanceKm: number
  periodStart?: string
  periodEnd?: string
  group?: string
}

export interface StatsResponse {
  from: string | null
  to: string | null
  groupBy: GroupBy
  items: DistanceAggregate[]
}

export async function getStats(request: StatsRequest = {}): Promise<StatsResponse> {
  const params = new URLSearchParams()
  if (request.from) params.append('from', request.from)
  if (request.to) params.append('to', request.to)
  if (request.groupBy) params.append('groupBy', request.groupBy)

  const query = params.toString()
  return fetchApi<StatsResponse>(`/stats/distances${query ? `?${query}` : ''}`, undefined, true)
}
