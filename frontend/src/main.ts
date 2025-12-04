import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'

// Theme MOB - Montreux Oberland Bernois
// Inspiré des chemins de fer suisses et du GoldenPass
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'mobTheme',
    themes: {
      mobTheme: {
        dark: false,
        colors: {
          // Couleurs principales MOB
          primary: '#C8102E', // Rouge suisse ferroviaire
          secondary: '#1A1A2E', // Bleu nuit profond
          accent: '#D4AF37', // Or GoldenPass
          background: '#FAFAFA',
          surface: '#FFFFFF',

          // États
          error: '#D32F2F',
          info: '#0288D1',
          success: '#2E7D32',
          warning: '#F57C00',

          // Personnalisés
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'rail-dark': '#2C3E50',
          'rail-light': '#ECF0F1',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#E53935',
          secondary: '#1A1A2E',
          accent: '#FFD700',
          background: '#121212',
          surface: '#1E1E1E',
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
