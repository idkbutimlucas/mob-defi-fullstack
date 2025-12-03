import type { Meta, StoryObj } from '@storybook/vue3'
import StatsView from '../views/StatsView.vue'

const meta = {
  title: 'Views/StatsView',
  component: StatsView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithData: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/v1/stats/distances',
        method: 'GET',
        status: 200,
        response: {
          from: null,
          to: null,
          groupBy: 'none',
          items: [
            { analyticCode: 'PASSENGER', totalDistanceKm: 1250.5 },
            { analyticCode: 'FREIGHT', totalDistanceKm: 450.2 },
            { analyticCode: 'MAINTENANCE', totalDistanceKm: 125.0 },
          ],
        },
      },
    ],
  },
}

export const GroupedByMonth: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/v1/stats/distances',
        method: 'GET',
        status: 200,
        response: {
          from: '2025-01-01',
          to: '2025-03-31',
          groupBy: 'month',
          items: [
            { analyticCode: 'PASSENGER', totalDistanceKm: 420.5, group: '2025-01' },
            { analyticCode: 'PASSENGER', totalDistanceKm: 380.0, group: '2025-02' },
            { analyticCode: 'PASSENGER', totalDistanceKm: 450.0, group: '2025-03' },
            { analyticCode: 'FREIGHT', totalDistanceKm: 150.2, group: '2025-01' },
            { analyticCode: 'FREIGHT', totalDistanceKm: 160.0, group: '2025-02' },
            { analyticCode: 'FREIGHT', totalDistanceKm: 140.0, group: '2025-03' },
          ],
        },
      },
    ],
  },
}

export const Empty: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/v1/stats/distances',
        method: 'GET',
        status: 200,
        response: {
          from: null,
          to: null,
          groupBy: 'none',
          items: [],
        },
      },
    ],
  },
}
