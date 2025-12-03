import type { Meta, StoryObj } from '@storybook/vue3'
import HomeView from '../views/HomeView.vue'

const meta = {
  title: 'Views/HomeView',
  component: HomeView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithMockedData: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/v1/stations',
        method: 'GET',
        status: 200,
        response: [
          { id: 'MX', name: 'Montreux' },
          { id: 'CGE', name: 'College' },
          { id: 'ZW', name: 'Zweisimmen' },
        ],
      },
    ],
  },
}
