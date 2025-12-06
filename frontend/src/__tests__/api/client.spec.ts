import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getStations,
  calculateRoute,
  getStats,
  login,
  register,
  getCurrentUser,
  logout,
  setAuthToken,
  loadStoredToken,
  getAuthToken,
  type Station,
  type RouteResponse,
  type StatsResponse,
  type User,
  type RegisterResponse,
} from '@/api/client'

describe('API Client', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockFetch.mockReset()
  })

  describe('getStations', () => {
    it('should fetch stations successfully', async () => {
      const mockStations: Station[] = [
        { id: 'MX', name: 'Montreux' },
        { id: 'ZW', name: 'Zweisimmen' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStations),
      })

      const result = await getStations()

      expect(result).toEqual(mockStations)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/stations'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      })

      await expect(getStations()).rejects.toThrow('Server error')
    })
  })

  describe('calculateRoute', () => {
    it('should calculate route successfully', async () => {
      const mockRoute: RouteResponse = {
        id: '123',
        fromStationId: 'MX',
        toStationId: 'ZW',
        analyticCode: 'PASSENGER',
        distanceKm: 62.4,
        path: ['MX', 'CGE', 'ZW'],
        segmentDistances: [30.2, 32.2],
        createdAt: '2025-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoute),
      })

      const result = await calculateRoute({
        fromStationId: 'MX',
        toStationId: 'ZW',
        analyticCode: 'PASSENGER',
      })

      expect(result).toEqual(mockRoute)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/routes'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            fromStationId: 'MX',
            toStationId: 'ZW',
            analyticCode: 'PASSENGER',
          }),
        })
      )
    })

    it('should throw error when station not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ message: 'Station "UNKNOWN" not found' }),
      })

      await expect(
        calculateRoute({
          fromStationId: 'UNKNOWN',
          toStationId: 'ZW',
          analyticCode: 'TEST',
        })
      ).rejects.toThrow('Station "UNKNOWN" not found')
    })
  })

  describe('getStats', () => {
    it('should fetch stats without parameters', async () => {
      const mockStats: StatsResponse = {
        from: null,
        to: null,
        groupBy: 'none',
        items: [
          { analyticCode: 'PASSENGER', totalDistanceKm: 150.5 },
          { analyticCode: 'FREIGHT', totalDistanceKm: 75.2 },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      })

      const result = await getStats()

      expect(result).toEqual(mockStats)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/stats/distances'),
        expect.any(Object)
      )
    })

    it('should fetch stats with date filters', async () => {
      const mockStats: StatsResponse = {
        from: '2025-01-01',
        to: '2025-12-31',
        groupBy: 'month',
        items: [
          {
            analyticCode: 'PASSENGER',
            totalDistanceKm: 50.0,
            periodStart: '2025-01-01',
            periodEnd: '2025-01-31',
            group: '2025-01',
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      })

      const result = await getStats({
        from: '2025-01-01',
        to: '2025-12-31',
        groupBy: 'month',
      })

      expect(result).toEqual(mockStats)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/from=2025-01-01.*to=2025-12-31.*groupBy=month/),
        expect.any(Object)
      )
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid groupBy parameter' }),
      })

      await expect(getStats({ groupBy: 'invalid' as any })).rejects.toThrow(
        'Invalid groupBy parameter'
      )
    })
  })

  describe('login', () => {
    it('should login successfully and store token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-jwt-token' }),
      })

      const token = await login('testuser', 'password123')

      expect(token).toBe('test-jwt-token')
      expect(getAuthToken()).toBe('test-jwt-token')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        })
      )
    })

    it('should throw error on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })

      await expect(login('wronguser', 'wrongpass')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockResponse: RegisterResponse = {
        message: 'User registered successfully',
        user: {
          id: 'uuid-123',
          username: 'newuser',
          email: 'new@example.com',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      })

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'newuser',
            email: 'new@example.com',
            password: 'password123',
          }),
        })
      )
    })

    it('should throw error on duplicate username', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ message: 'Username already exists' }),
      })

      await expect(
        register({
          username: 'existinguser',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Username already exists')
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      const mockUser: User = {
        id: 'uuid-123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['ROLE_USER'],
      }

      // Set auth token first
      setAuthToken('valid-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })

      const result = await getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      )
    })

    it('should throw error when not authenticated', async () => {
      setAuthToken(null)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      })

      await expect(getCurrentUser()).rejects.toThrow('Unauthorized')
    })
  })

  describe('logout', () => {
    it('should clear auth token', () => {
      setAuthToken('some-token')
      expect(getAuthToken()).toBe('some-token')

      logout()

      expect(getAuthToken()).toBeNull()
    })
  })

  describe('setAuthToken', () => {
    it('should set token in memory and localStorage', () => {
      setAuthToken('new-token')

      expect(getAuthToken()).toBe('new-token')
      expect(localStorage.getItem('authToken')).toBe('new-token')
    })

    it('should remove token when set to null', () => {
      setAuthToken('token-to-remove')
      setAuthToken(null)

      expect(getAuthToken()).toBeNull()
      expect(localStorage.getItem('authToken')).toBeNull()
    })
  })

  describe('loadStoredToken', () => {
    it('should load token from localStorage', () => {
      localStorage.setItem('authToken', 'stored-token')

      const token = loadStoredToken()

      expect(token).toBe('stored-token')
      expect(getAuthToken()).toBe('stored-token')
    })

    it('should return null when no token stored', () => {
      localStorage.removeItem('authToken')

      const token = loadStoredToken()

      expect(token).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should handle non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })

      await expect(getStations()).rejects.toThrow('Unknown error')
    })

    it('should use HTTP status when no message provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(getStations()).rejects.toThrow('HTTP error 404')
    })
  })
})
