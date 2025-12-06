import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'
import * as api from '@/api/client'

vi.mock('@/api/client', () => ({
  getStations: vi.fn(),
  calculateRoute: vi.fn(),
}))

describe('HomeView', () => {
  const mockStations = [
    { id: 'MX', name: 'Montreux' },
    { id: 'ZW', name: 'Zweisimmen' },
    { id: 'CGE', name: 'College' },
  ]

  beforeEach(() => {
    vi.mocked(api.getStations).mockResolvedValue(mockStations)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the calculator title', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Calculateur de trajet')
  })

  it('should load stations on mount', async () => {
    mount(HomeView)
    await flushPromises()

    expect(api.getStations).toHaveBeenCalledOnce()
  })

  it('should display error when stations fail to load', async () => {
    vi.mocked(api.getStations).mockRejectedValueOnce(new Error('Network error'))

    const wrapper = mount(HomeView)
    await flushPromises()

    expect(wrapper.text()).toContain('Network error')
  })

  it('should have disabled button when form is incomplete', async () => {
    const wrapper = mount(HomeView)
    await flushPromises()

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should calculate route on form submit', async () => {
    const mockRoute = {
      id: '123',
      fromStationId: 'MX',
      toStationId: 'ZW',
      analyticCode: 'PASSENGER',
      distanceKm: 62.4,
      path: ['MX', 'CGE', 'ZW'],
      segmentDistances: [30.2, 32.2],
      createdAt: '2025-01-01T00:00:00Z',
    }

    vi.mocked(api.calculateRoute).mockResolvedValueOnce(mockRoute)

    const wrapper = mount(HomeView)
    await flushPromises()

    // Set form values using component's internal state
    await wrapper.vm.$nextTick()
    ;(wrapper.vm as any).fromStation = 'MX'
    ;(wrapper.vm as any).toStation = 'ZW'
    ;(wrapper.vm as any).analyticCode = 'PASSENGER'
    await wrapper.vm.$nextTick()

    // Submit form
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(api.calculateRoute).toHaveBeenCalledWith({
      fromStationId: 'MX',
      toStationId: 'ZW',
      analyticCode: 'PASSENGER',
    })
  })

  it('should display route result after calculation', async () => {
    const mockRoute = {
      id: '123',
      fromStationId: 'MX',
      toStationId: 'ZW',
      analyticCode: 'PASSENGER',
      distanceKm: 62.4,
      path: ['MX', 'CGE', 'ZW'],
      segmentDistances: [30.2, 32.2],
      createdAt: '2025-01-01T00:00:00Z',
    }

    vi.mocked(api.calculateRoute).mockResolvedValueOnce(mockRoute)

    const wrapper = mount(HomeView)
    await flushPromises()

    // Set result directly to test display
    ;(wrapper.vm as any).result = mockRoute
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('62.40 km')
    expect(wrapper.text()).toContain('3 stations')
  })

  it('should handle custom analytic code', async () => {
    vi.mocked(api.calculateRoute).mockResolvedValueOnce({
      id: '123',
      fromStationId: 'MX',
      toStationId: 'ZW',
      analyticCode: 'CUSTOM',
      distanceKm: 50.0,
      path: ['MX', 'ZW'],
      segmentDistances: [50.0],
      createdAt: '2025-01-01T00:00:00Z',
    })

    const wrapper = mount(HomeView)
    await flushPromises()

    // Enable custom code
    ;(wrapper.vm as any).useCustomCode = true
    ;(wrapper.vm as any).customCode = 'custom'
    ;(wrapper.vm as any).fromStation = 'MX'
    ;(wrapper.vm as any).toStation = 'ZW'
    await wrapper.vm.$nextTick()

    // Check effective analytic code is uppercase
    expect((wrapper.vm as any).effectiveAnalyticCode).toBe('CUSTOM')
  })

  it('should show error when form is invalid on submit', async () => {
    const wrapper = mount(HomeView)
    await flushPromises()

    // Try to submit without filling form
    await (wrapper.vm as any).submitForm()
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as any).error).toBe('Veuillez remplir tous les champs correctement')
  })

  it('should swap stations when swapStations is called', async () => {
    const wrapper = mount(HomeView)
    await flushPromises()
    ;(wrapper.vm as any).fromStation = 'MX'
    ;(wrapper.vm as any).toStation = 'ZW'
    await wrapper.vm.$nextTick()

    // Swap stations
    ;(wrapper.vm as any).swapStations()
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as any).fromStation).toBe('ZW')
    expect((wrapper.vm as any).toStation).toBe('MX')
  })

  it('should get station name from id', async () => {
    const wrapper = mount(HomeView)
    await flushPromises()

    const stationName = (wrapper.vm as any).getStationName('MX')
    expect(stationName).toBe('Montreux')
  })

  it('should return id if station not found', async () => {
    const wrapper = mount(HomeView)
    await flushPromises()

    const stationName = (wrapper.vm as any).getStationName('UNKNOWN')
    expect(stationName).toBe('UNKNOWN')
  })

  it('should prevent same station selection', async () => {
    const wrapper = mount(HomeView)
    await flushPromises()
    ;(wrapper.vm as any).fromStation = 'MX'
    ;(wrapper.vm as any).toStation = 'MX'
    ;(wrapper.vm as any).analyticCode = 'PASSENGER'
    await wrapper.vm.$nextTick()

    // Form should not be valid
    expect((wrapper.vm as any).isFormValid).toBe(false)
  })

  it('should use predefined analytic code when custom is disabled', async () => {
    const wrapper = mount(HomeView)
    await flushPromises()
    ;(wrapper.vm as any).useCustomCode = false
    ;(wrapper.vm as any).analyticCode = 'FREIGHT'
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as any).effectiveAnalyticCode).toBe('FREIGHT')
  })
})
