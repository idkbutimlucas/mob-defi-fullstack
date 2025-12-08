/**
 * Mock data for Storybook - used by fetch interceptor
 * This allows testing views without a real backend
 * Data format matches the API interfaces in src/api/client.ts
 */

// Matches Station interface: { id: string, name: string }
export const mockStations = [
  { id: 'MX', name: 'Montreux' },
  { id: 'CL', name: 'Clarens' },
  { id: 'CHX', name: "Chateau-d'Oex" },
  { id: 'ROU', name: 'Rougemont' },
  { id: 'SAA', name: 'Saanen' },
  { id: 'GST', name: 'Gstaad' },
  { id: 'SCH', name: 'Schonried' },
  { id: 'GD', name: 'Gsteig' },
  { id: 'ZW', name: 'Zweisimmen' },
  { id: 'LEN', name: 'Lenk' },
  { id: 'BLON', name: 'Blonay' },
  { id: 'VV', name: 'Vevey' },
  { id: 'CABY', name: 'Chamby' },
  { id: 'PLEI', name: 'Les Pleiades' },
  { id: 'SM', name: 'St-Legier-La Chiesaz' },
]

// Matches RouteResponse interface
export const mockRouteResponse = {
  id: 'mock-route-123',
  fromStationId: 'MX',
  toStationId: 'GST',
  analyticCode: 'PASSENGER',
  distanceKm: 52.3,
  path: ['MX', 'CL', 'CABY', 'CHX', 'ROU', 'SAA', 'GST'],
  segmentDistances: [2.1, 5.4, 12.3, 8.7, 6.2, 17.6],
  createdAt: new Date().toISOString(),
}

// Matches StatsResponse interface
export const mockStatsResponse = {
  from: null,
  to: null,
  groupBy: 'none',
  items: [
    {
      analyticCode: 'PASSENGER',
      totalDistanceKm: 523.2,
    },
    {
      analyticCode: 'FREIGHT',
      totalDistanceKm: 312.8,
    },
    {
      analyticCode: 'MAINTENANCE',
      totalDistanceKm: 198.5,
    },
    {
      analyticCode: 'SERVICE',
      totalDistanceKm: 200.0,
    },
  ],
}

// Empty stats response for "no data" scenario
export const mockStatsEmptyResponse = {
  from: null,
  to: null,
  groupBy: 'none',
  items: [],
}

// Matches LoginResponse interface
export const mockLoginResponse = {
  token: 'mock-jwt-token-for-storybook',
}
