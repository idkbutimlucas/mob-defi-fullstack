import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StatsView from '@/views/StatsView.vue'
import * as api from '@/api/client'

vi.mock('@/api/client', () => ({
  getStats: vi.fn(),
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
    expect(wrapper.text()).toContain('Statistiques par Code Analytique')
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

    expect(wrapper.text()).toContain('Periode')
    expect(wrapper.text()).toContain('2025-01')
  })
})
