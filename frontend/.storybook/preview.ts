import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { loadStoredToken } from '../src/api/client'

// Mock data for Storybook
const mockStations = [
  { id: 'MX', name: 'Montreux' },
  { id: 'CGE', name: 'Collège' },
  { id: 'VT', name: 'Vuarennes-Territet' },
  { id: 'GLI', name: 'Glion' },
  { id: 'CAUX', name: 'Caux' },
  { id: 'JDP', name: 'Jaman-Dent de Jaman' },
  { id: 'CABY', name: 'Chamby' },
  { id: 'FYN', name: 'Fontanivent' },
  { id: 'CTY', name: 'Châtelard' },
  { id: 'SM', name: 'Les Avants' },
  { id: 'SG', name: 'Sendy-Sollard' },
  { id: 'MO', name: 'Montbovon' },
  { id: 'AL', name: 'Allières' },
  { id: 'LEC', name: 'Les Cases' },
  { id: 'SAAN', name: 'Saanen' },
  { id: 'GST', name: 'Gstaad' },
  { id: 'SCH', name: 'Schönried' },
  { id: 'ZW', name: 'Zweisimmen' },
]

const mockStats = {
  from: null,
  to: null,
  groupBy: 'none',
  items: [
    { analyticCode: 'PASSENGER', totalDistanceKm: 1250.5 },
    { analyticCode: 'FREIGHT', totalDistanceKm: 450.2 },
    { analyticCode: 'MAINTENANCE', totalDistanceKm: 125.0 },
    { analyticCode: 'SERVICE', totalDistanceKm: 85.3 },
  ],
}

const mockRouteResponse = {
  id: 'mock-route-id',
  fromStationId: 'MX',
  toStationId: 'ZW',
  analyticCode: 'PASSENGER',
  distanceKm: 62.4,
  path: ['MX', 'CGE', 'GLI', 'CAUX', 'SM', 'MO', 'SAAN', 'GST', 'ZW'],
  segmentDistances: [1.2, 3.5, 4.2, 8.1, 12.3, 15.6, 8.2, 9.3],
  createdAt: new Date().toISOString(),
}

// Mock fetch for Storybook
const originalFetch = window.fetch
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString()

  // Mock /stations endpoint
  if (url.includes('/stations')) {
    return new Response(JSON.stringify(mockStations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Mock /stats/distances endpoint
  if (url.includes('/stats/distances')) {
    return new Response(JSON.stringify(mockStats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Mock /routes endpoint
  if (url.includes('/routes') && init?.method === 'POST') {
    return new Response(JSON.stringify(mockRouteResponse), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Mock /login endpoint
  if (url.includes('/login') && init?.method === 'POST') {
    return new Response(JSON.stringify({ token: 'mock-jwt-token' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Mock /me endpoint
  if (url.includes('/me')) {
    return new Response(
      JSON.stringify({
        id: 'mock-user-id',
        username: 'demo_user',
        email: 'demo@example.com',
        roles: ['ROLE_USER'],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Fallback to original fetch
  return originalFetch(input, init)
}

// Set mock auth token and load it into the client
localStorage.setItem('authToken', 'mock-jwt-token-for-storybook')
loadStoredToken()

// Theme MOB - Identique à main.ts
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'mobTheme',
    themes: {
      mobTheme: {
        dark: false,
        colors: {
          // Couleurs MOB officielles
          primary: '#001f78', // Bleu MOB
          secondary: '#001f78', // Bleu MOB
          accent: '#e6007e', // Pink MOB
          background: '#f1f1f1', // Gris clair
          surface: '#FFFFFF',

          // Etats
          error: '#D32F2F',
          info: '#0288D1',
          success: '#228b22', // Vert MOB
          warning: '#F57C00',

          // Personnalises
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
      rounded: 0,
    },
    VBtn: {
      rounded: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 0,
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 0,
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 0,
    },
    VChip: {
      rounded: 0,
    },
    VAlert: {
      rounded: 0,
    },
    VTab: {
      rounded: 0,
    },
  },
})

const pinia = createPinia()

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/stats', name: 'stats', component: { template: '<div>Stats</div>' } },
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/signup', name: 'signup', component: { template: '<div>Signup</div>' } },
  ],
})

setup((app) => {
  app.use(vuetify)
  app.use(pinia)
  app.use(router)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'mob',
      values: [
        { name: 'mob', value: '#f1f1f1' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: `
        <v-app>
          <v-main style="background: #f1f1f1; min-height: 100vh;">
            <v-container class="py-8" style="max-width: 1000px;">
              <story />
            </v-container>
          </v-main>
        </v-app>
      `,
    }),
  ],
}

export default preview
