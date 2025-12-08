import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { handlers } from '../src/mocks/handlers'

// Initialize MSW
initialize()

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
    msw: {
      handlers: handlers,
    },
  },
  loaders: [mswLoader],
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
