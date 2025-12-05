import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify - import everything from main entry to avoid pre-bundling issues
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'
import { login } from './api/client'

// Auto-login with API credentials
async function initAuth(): Promise<void> {
  try {
    const username = import.meta.env.VITE_API_USERNAME || 'api'
    const password = import.meta.env.VITE_API_PASSWORD || 'secret'
    await login(username, password)
    console.log('API authentication successful')
  } catch (error) {
    console.warn('API authentication failed:', error)
  }
}

// Theme MOB - Montreux Oberland Bernois
// Inspiré du site officiel mob.ch
const vuetify = createVuetify({
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

          // États
          error: '#D32F2F',
          info: '#0288D1',
          success: '#228b22', // Vert MOB
          warning: '#F57C00',

          // Personnalisés
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

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

// Initialize auth then mount app
initAuth().finally(() => {
  app.mount('#app')
})
