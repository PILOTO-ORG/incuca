<template>
  <v-app>
    <v-app-bar
      v-if="showAppBar"
      app
      color="primary"
      dark
      elevation="4"
    >
      <v-app-bar-title class="d-flex align-center">
        <v-icon class="me-2">mdi-emoticon-happy</v-icon>
        {{ $appName }}
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- User info e logout quando logado -->
      <template v-if="userStore.isAuthenticated">
        <v-chip
          color="accent"
          variant="outlined"
          class="me-4"
        >
          <v-icon start>mdi-account</v-icon>
          {{ userStore.user?.name }}
        </v-chip>

        <v-btn
          icon="mdi-logout"
          @click="handleLogout"
          :loading="isLoggingOut"
        />
      </template>

      <!-- Indicador de humor -->
      <v-chip
        v-if="showMoodIndicator"
        :color="currentMoodColor"
        variant="elevated"
        class="me-4"
      >
        <v-icon start>{{ currentMoodIcon }}</v-icon>
        {{ currentMoodText }}
      </v-chip>
    </v-app-bar>

    <v-main>
      <router-view v-slot="{ Component }">
        <transition
          name="page"
          mode="out-in"
          appear
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <!-- Loading global -->
    <v-overlay
      v-model="isGlobalLoading"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      />
      <div class="text-h6 mt-4">Carregando...</div>
    </v-overlay>

    <!-- Snackbar para notificações -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.color"
      :timeout="notification.timeout"
      location="top right"
    >
      {{ notification.message }}
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="notification.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import { useMoodStore } from './stores/mood'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const moodStore = useMoodStore()
const toast = useToast()

// Estados reativo
const isLoggingOut = ref(false)
const isGlobalLoading = ref(false)
const notification = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 5000
})

// Computadas
const showAppBar = computed(() => route.name !== 'Login')
const showMoodIndicator = computed(() => {
  return userStore.isAuthenticated && route.name !== 'Login'
})

const currentMoodColor = computed(() => {
  const moodColors = {
    inicial: 'neutral',
    triste: 'sad',
    'poker-face': 'info', 
    feliz: 'happy'
  }
  return moodColors[moodStore.currentMood] || 'neutral'
})

const currentMoodIcon = computed(() => {
  const moodIcons = {
    inicial: 'mdi-emoticon-neutral',
    triste: 'mdi-emoticon-sad',
    'poker-face': 'mdi-emoticon-cool',
    feliz: 'mdi-emoticon-happy'
  }
  return moodIcons[moodStore.currentMood] || 'mdi-emoticon-neutral'
})

const currentMoodText = computed(() => {
  const moodTexts = {
    inicial: 'Neutro',
    triste: 'Triste',
    'poker-face': 'Poker Face',
    feliz: 'Feliz'
  }
  return moodTexts[moodStore.currentMood] || 'Indefinido'
})

// Métodos
const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await userStore.logout()
    toast.success('Logout realizado com sucesso!')
    router.push('/login')
  } catch (error) {
    toast.error('Erro ao fazer logout')
  } finally {
    isLoggingOut.value = false
  }
}

// Watchers
watch(() => route.name, (newRoute) => {
  // Atualizar mood baseado na rota
  if (newRoute && ['inicial', 'triste', 'poker-face', 'feliz'].includes(newRoute)) {
    moodStore.setMood(newRoute)
  }
})

// Verificar autenticação ao carregar
userStore.checkAuth()
</script>

<style scoped>
/* Transições entre páginas */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Animações customizadas */
.v-app-bar-title {
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
