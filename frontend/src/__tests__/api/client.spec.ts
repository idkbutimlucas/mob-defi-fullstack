import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getStations,
  calculateRoute,
  getStats,
  type Station,
  type RouteResponse,
  type StatsResponse,
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
})
