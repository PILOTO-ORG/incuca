import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import Toast from 'vue-toastification'

import App from './App.vue'
import router from './router'
import LoggerPlugin from './plugins/logger'

// Estilos
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import 'vue-toastification/dist/index.css'
import './style.css'

// Configuração do Vuetify
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          neutral: '#9E9E9E',
          sad: '#455A64',
          happy: '#FFC107'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          neutral: '#9E9E9E',
          sad: '#37474F',
          happy: '#FFD54F'
        }
      }
    }
  },
  defaults: {
    VBtn: {
      variant: 'elevated'
    },
    VCard: {
      variant: 'elevated'
    }
  }
})

// Configuração do Toast
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Criar aplicação
const app = createApp(App)

// Usar plugins
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(Toast, toastOptions)
app.use(LoggerPlugin)

// Configuração global
app.config.globalProperties.$appName = 'Incuca Geek Jokes'
app.config.globalProperties.$version = '1.0.0'

// Mount da aplicação
app.mount('#app')
