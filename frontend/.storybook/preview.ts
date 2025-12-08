import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import {
  mockStations,
  mockRouteResponse,
  mockStatsResponse,
  mockStatsEmptyResponse,
  mockLoginResponse,
} from './mockData'

// Declare global scenario variable for error stories
declare global {
  interface Window {
    __STORYBOOK_SCENARIO__?: string
  }
}

// Mock fetch for Storybook - intercepts API calls and returns mock data
// This replaces MSW which doesn't work with Storybook 8 + Vite
const originalFetch = window.fetch
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString()
  const scenario = window.__STORYBOOK_SCENARIO__ || 'default'

  // Only intercept API calls
  if (url.includes('/api/v1/')) {
    const method = init?.method?.toUpperCase() || 'GET'

    // Mock /stations endpoint
    if (url.includes('/stations')) {
      if (scenario === 'stations-error') {
        return new Response(
          JSON.stringify({ message: 'Erreur de connexion au serveur' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return new Response(JSON.stringify(mockStations), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Mock POST /routes endpoint
    if (url.includes('/routes') && method === 'POST') {
      if (scenario === 'route-error') {
        return new Response(
          JSON.stringify({ message: 'Aucun chemin trouve entre ces stations' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return new Response(JSON.stringify(mockRouteResponse), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Mock /stats/distances endpoint
    if (url.includes('/stats/distances')) {
      if (scenario === 'stats-error') {
        return new Response(
          JSON.stringify({ message: 'Erreur lors du chargement des statistiques' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if (scenario === 'stats-empty') {
        return new Response(JSON.stringify(mockStatsEmptyResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify(mockStatsResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Mock POST /login endpoint
    if (url.includes('/login') && method === 'POST') {
      if (scenario === 'login-error') {
        return new Response(
          JSON.stringify({ message: 'Identifiants incorrects' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return new Response(JSON.stringify(mockLoginResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Mock POST /register endpoint
    if (url.includes('/register') && method === 'POST') {
      if (scenario === 'register-email-exists') {
        return new Response(
          JSON.stringify({ message: 'Cet email est deja utilise' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ message: 'User created successfully', user: { id: '1', username: 'new_user', email: 'new@mob.ch' } }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Mock /me endpoint
    if (url.includes('/me')) {
      return new Response(
        JSON.stringify({ id: '1', username: 'demo_user', email: 'demo@mob.ch', roles: ['ROLE_USER'] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // For non-API calls, use original fetch
  return originalFetch(input, init)
}

// Set fake auth token for Storybook
localStorage.setItem('authToken', 'storybook-mock-token')


// Theme MOB - Identique a main.ts
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
