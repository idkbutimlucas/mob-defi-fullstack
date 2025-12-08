import { http, HttpResponse, delay } from 'msw'

// Mock data
export const mockStations = [
  { id: 'MX', shortName: 'MX', longName: 'Montreux' },
  { id: 'GLN', shortName: 'GLN', longName: 'Glion' },
  { id: 'CAUX', shortName: 'CAUX', longName: 'Caux' },
  { id: 'JMN', shortName: 'JMN', longName: 'Jaman' },
  { id: 'ADL', shortName: 'ADL', longName: 'Les Avants' },
  { id: 'SDG', shortName: 'SDG', longName: 'Sendy-Sollard' },
  { id: 'CHMX', shortName: 'CHMX', longName: 'Chamby' },
  { id: 'CHAT', shortName: 'CHAT', longName: 'Chernex' },
  { id: 'SOOG', shortName: 'SOOG', longName: 'Sonzier' },
  { id: 'MOB', shortName: 'MOB', longName: 'Les Cases' },
  { id: 'MTB', shortName: 'MTB', longName: 'Montbovon' },
  { id: 'ALL', shortName: 'ALL', longName: 'Allieres' },
  { id: 'CH', shortName: 'CH', longName: 'Chateau-dOex' },
  { id: 'ROSS', shortName: 'ROSS', longName: 'Rossiniere' },
  { id: 'SAA', shortName: 'SAA', longName: 'Saanen' },
  { id: 'GST', shortName: 'GST', longName: 'Gstaad' },
  { id: 'SCH', shortName: 'SCH', longName: 'Schonried' },
  { id: 'GSW', shortName: 'GSW', longName: 'Saanenmoeser' },
  { id: 'ZW', shortName: 'ZW', longName: 'Zweisimmen' },
]

export const mockRouteResult = {
  id: 'route-123',
  fromStationId: 'MX',
  toStationId: 'ZW',
  analyticCode: 'PASSENGER',
  distanceKm: 62.4,
  path: [
    'MX',
    'GLN',
    'CAUX',
    'JMN',
    'ADL',
    'CHMX',
    'MTB',
    'ALL',
    'CH',
    'ROSS',
    'SAA',
    'GST',
    'SCH',
    'GSW',
    'ZW',
  ],
  segmentDistances: [
    { from: 'MX', to: 'GLN', distance: 2.1 },
    { from: 'GLN', to: 'CAUX', distance: 3.5 },
    { from: 'CAUX', to: 'JMN', distance: 4.2 },
    { from: 'JMN', to: 'ADL', distance: 3.8 },
    { from: 'ADL', to: 'CHMX', distance: 5.1 },
    { from: 'CHMX', to: 'MTB', distance: 8.3 },
    { from: 'MTB', to: 'ALL', distance: 4.7 },
    { from: 'ALL', to: 'CH', distance: 6.2 },
    { from: 'CH', to: 'ROSS', distance: 5.4 },
    { from: 'ROSS', to: 'SAA', distance: 4.9 },
    { from: 'SAA', to: 'GST', distance: 3.6 },
    { from: 'GST', to: 'SCH', distance: 3.2 },
    { from: 'SCH', to: 'GSW', distance: 2.8 },
    { from: 'GSW', to: 'ZW', distance: 4.6 },
  ],
  createdAt: new Date().toISOString(),
}

export const mockStatsData = {
  from: '2024-01-01',
  to: '2024-12-31',
  groupBy: 'month',
  items: [
    { analyticCode: 'PASSENGER', totalDistanceKm: 15420.5, group: '2024-01' },
    { analyticCode: 'PASSENGER', totalDistanceKm: 14280.3, group: '2024-02' },
    { analyticCode: 'PASSENGER', totalDistanceKm: 16890.7, group: '2024-03' },
    { analyticCode: 'FREIGHT', totalDistanceKm: 8450.2, group: '2024-01' },
    { analyticCode: 'FREIGHT', totalDistanceKm: 7920.8, group: '2024-02' },
    { analyticCode: 'FREIGHT', totalDistanceKm: 9120.4, group: '2024-03' },
    { analyticCode: 'MAINTENANCE', totalDistanceKm: 2340.1, group: '2024-01' },
    { analyticCode: 'MAINTENANCE', totalDistanceKm: 2180.5, group: '2024-02' },
    { analyticCode: 'MAINTENANCE', totalDistanceKm: 2560.3, group: '2024-03' },
    { analyticCode: 'SERVICE', totalDistanceKm: 1250.4, group: '2024-01' },
    { analyticCode: 'SERVICE', totalDistanceKm: 1180.2, group: '2024-02' },
    { analyticCode: 'SERVICE', totalDistanceKm: 1420.6, group: '2024-03' },
  ],
}

export const mockUser = {
  id: 'user-123',
  username: 'demo_user',
  email: 'demo@mob.ch',
  roles: ['ROLE_USER'],
}

// Default handlers
export const handlers = [
  // Stations
  http.get('*/api/v1/stations', async () => {
    await delay(100)
    return HttpResponse.json(mockStations)
  }),

  // Routes
  http.post('*/api/v1/routes', async () => {
    await delay(500)
    return HttpResponse.json(mockRouteResult, { status: 201 })
  }),

  // Stats
  http.get('*/api/v1/stats/distances', async () => {
    await delay(300)
    return HttpResponse.json(mockStatsData)
  }),

  // Auth - Login
  http.post('*/api/v1/login', async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string }
    await delay(300)

    if (body.username === 'demo' && body.password === 'demo123') {
      return HttpResponse.json({ token: 'mock-jwt-token' })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  // Auth - Register
  http.post('*/api/v1/register', async () => {
    await delay(300)
    return HttpResponse.json(
      {
        message: 'User registered successfully',
        user: mockUser,
      },
      { status: 201 }
    )
  }),

  // Auth - Current user
  http.get('*/api/v1/me', async () => {
    await delay(100)
    return HttpResponse.json(mockUser)
  }),
]

// Error handlers for specific stories
export const errorHandlers = {
  stationsError: http.get('*/api/v1/stations', async () => {
    await delay(100)
    return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }),

  routeNotFound: http.post('*/api/v1/routes', async () => {
    await delay(300)
    return HttpResponse.json({ message: 'No route found between stations' }, { status: 422 })
  }),

  stationNotFound: http.post('*/api/v1/routes', async () => {
    await delay(300)
    return HttpResponse.json({ message: 'Station not found: INVALID' }, { status: 422 })
  }),

  loginError: http.post('*/api/v1/login', async () => {
    await delay(300)
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  registerConflict: http.post('*/api/v1/register', async () => {
    await delay(300)
    return HttpResponse.json({ message: 'Username already exists' }, { status: 409 })
  }),

  registerValidationError: http.post('*/api/v1/register', async () => {
    await delay(300)
    return HttpResponse.json(
      {
        message: 'Validation failed',
        errors: {
          username: 'Username is too short',
          email: 'Invalid email format',
        },
      },
      { status: 400 }
    )
  }),

  statsEmpty: http.get('*/api/v1/stats/distances', async () => {
    await delay(200)
    return HttpResponse.json({
      from: null,
      to: null,
      groupBy: 'none',
      items: [],
    })
  }),
}

// Loading handlers (with long delays)
export const loadingHandlers = {
  stationsLoading: http.get('*/api/v1/stations', async () => {
    await delay(10000) // Very long delay
    return HttpResponse.json(mockStations)
  }),

  routeLoading: http.post('*/api/v1/routes', async () => {
    await delay(10000)
    return HttpResponse.json(mockRouteResult, { status: 201 })
  }),

  statsLoading: http.get('*/api/v1/stats/distances', async () => {
    await delay(10000)
    return HttpResponse.json(mockStatsData)
  }),

  loginLoading: http.post('*/api/v1/login', async () => {
    await delay(10000)
    return HttpResponse.json({ token: 'mock-jwt-token' })
  }),

  registerLoading: http.post('*/api/v1/register', async () => {
    await delay(10000)
    return HttpResponse.json({ message: 'User registered', user: mockUser }, { status: 201 })
  }),
}
