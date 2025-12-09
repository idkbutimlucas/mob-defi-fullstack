import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StatsView from '@/views/StatsView.vue'
import * as api from '@/api/client'

vi.mock('@/api/client', () => ({
  getStats: vi.fn(),
}))

// Mock authenticated user for all tests
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: true,
    user: { id: '1', username: 'test_user', email: 'test@test.com', roles: ['ROLE_USER'] },
  })),
}))

describe('StatsView', () => {
  const mockStatsEmpty = {
    from: null,
    to: null,
    groupBy: 'none' as const,
    items: [],
  }

  const mockStatsWithData = {
    from: '2025-01-01',
    to: '2025-12-31',
    groupBy: 'month' as const,
    items: [
      {
        analyticCode: 'PASSENGER',
        totalDistanceKm: 150.5,
        periodStart: '2025-01-01',
        periodEnd: '2025-01-31',
        group: '2025-01',
      },
      {
        analyticCode: 'FREIGHT',
        totalDistanceKm: 75.2,
        periodStart: '2025-01-01',
        periodEnd: '2025-01-31',
        group: '2025-01',
      },
    ],
  }

  beforeEach(() => {
    vi.mocked(api.getStats).mockResolvedValue(mockStatsEmpty)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the stats title', () => {
    const wrapper = mount(StatsView)
    expect(wrapper.text()).toContain('Statistiques')
    expect(wrapper.text()).toContain('Analysez les distances parcourues par code analytique')
  })

  it('should load stats on mount', async () => {
    mount(StatsView)
    await flushPromises()

    expect(api.getStats).toHaveBeenCalledOnce()
  })

  it('should display error when stats fail to load', async () => {
    vi.mocked(api.getStats).mockRejectedValueOnce(new Error('Network error'))

    const wrapper = mount(StatsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Network error')
  })

  it('should display stats data in table', async () => {
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsWithData)

    const wrapper = mount(StatsView)
    await flushPromises()

    // Switch to table tab
    ;(wrapper.vm as any).activeTab = 'table'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('PASSENGER')
    expect(wrapper.text()).toContain('150.50')
    expect(wrapper.text()).toContain('FREIGHT')
    expect(wrapper.text()).toContain('75.20')
  })

  it('should show empty state when no data', async () => {
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsEmpty)

    const wrapper = mount(StatsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Aucune donnee')
  })

  it('should fetch stats with filters on form submit', async () => {
    vi.mocked(api.getStats).mockResolvedValue(mockStatsWithData)

    const wrapper = mount(StatsView)
    await flushPromises()

    // Set filter values
    ;(wrapper.vm as any).fromDate = '2025-01-01'
    ;(wrapper.vm as any).toDate = '2025-12-31'
    ;(wrapper.vm as any).groupBy = 'month'
    await wrapper.vm.$nextTick()

    // Submit form
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(api.getStats).toHaveBeenLastCalledWith({
      from: '2025-01-01',
      to: '2025-12-31',
      groupBy: 'month',
    })
  })

  it('should display grouped data with period info', async () => {
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsEmpty) // Initial load
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsWithData) // After filter

    const wrapper = mount(StatsView)
    await flushPromises()

    // Set groupBy to month to show period column
    ;(wrapper.vm as any).groupBy = 'month'
    await wrapper.vm.$nextTick()

    // Submit to get grouped data
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Switch to table tab to see period column
    ;(wrapper.vm as any).activeTab = 'table'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Periode')
    expect(wrapper.text()).toContain('2025-01')
  })

  it('should compute chart data correctly', async () => {
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsWithData)

    const wrapper = mount(StatsView)
    await flushPromises()

    const barChartData = (wrapper.vm as any).barChartData
    expect(barChartData.labels).toHaveLength(2)
    expect(barChartData.datasets[0].data).toContain(150.5)
    expect(barChartData.datasets[0].data).toContain(75.2)
  })

  it('should compute doughnut chart data correctly', async () => {
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsWithData)

    const wrapper = mount(StatsView)
    await flushPromises()

    const doughnutData = (wrapper.vm as any).doughnutChartData
    expect(doughnutData.labels).toContain('PASSENGER')
    expect(doughnutData.labels).toContain('FREIGHT')
  })

  it('should return empty chart data when no stats', async () => {
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsEmpty)

    const wrapper = mount(StatsView)
    await flushPromises()

    const barChartData = (wrapper.vm as any).barChartData
    expect(barChartData.labels).toHaveLength(0)
    expect(barChartData.datasets).toHaveLength(0)
  })

  it('should compute total distance correctly', async () => {
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsWithData)

    const wrapper = mount(StatsView)
    await flushPromises()

    const totalDistance = (wrapper.vm as any).totalDistance
    expect(totalDistance).toBeCloseTo(225.7, 1)
  })

  it('should switch between chart and table tabs', async () => {
    vi.mocked(api.getStats).mockResolvedValueOnce(mockStatsWithData)

    const wrapper = mount(StatsView)
    await flushPromises()

    // Default is chart tab
    expect((wrapper.vm as any).activeTab).toBe('chart')

    // Switch to table
    ;(wrapper.vm as any).activeTab = 'table'
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as any).activeTab).toBe('table')
  })

  it('should handle groupBy options', async () => {
    const wrapper = mount(StatsView)
    await flushPromises()

    const groupByOptions = (wrapper.vm as any).groupByOptions
    expect(groupByOptions).toHaveLength(4)
    expect(groupByOptions.map((o: { value: string }) => o.value)).toContain('none')
    expect(groupByOptions.map((o: { value: string }) => o.value)).toContain('day')
    expect(groupByOptions.map((o: { value: string }) => o.value)).toContain('month')
    expect(groupByOptions.map((o: { value: string }) => o.value)).toContain('year')
  })

  it('should clear dates and reload when filter is reset', async () => {
    vi.mocked(api.getStats).mockResolvedValue(mockStatsWithData)

    const wrapper = mount(StatsView)
    await flushPromises()

    // Set some filter values
    ;(wrapper.vm as any).fromDate = '2025-01-01'
    ;(wrapper.vm as any).toDate = '2025-12-31'
    ;(wrapper.vm as any).groupBy = 'month'
    await wrapper.vm.$nextTick()

    // Call loadStats without filters
    ;(wrapper.vm as any).fromDate = ''
    ;(wrapper.vm as any).toDate = ''
    ;(wrapper.vm as any).groupBy = 'none'
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // API receives undefined for empty string filters
    expect(api.getStats).toHaveBeenLastCalledWith({
      from: undefined,
      to: undefined,
      groupBy: 'none',
    })
  })
})
