<template>
  <div class="error-container">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" class="text-center">
          
          <!-- Emoji 404 -->
          <div class="error-emoji-container mb-8">
            <div class="error-emoji animate-shake">
              🤔
            </div>
            <div class="error-code animate-fade-in-up">
              404
            </div>
          </div>

          <!-- Título -->
          <h1 class="display-1 font-weight-bold mb-4 animate-fade-in-up">
            Oops! Página não encontrada
          </h1>

          <!-- Descrição -->
          <p class="text-h6 mb-8 text-medium-emphasis">
            Parece que você tentou acessar uma rota que não existe no nosso universo de humor! 🌌
          </p>

          <!-- Card com piadas sobre bugs -->
          <v-card 
            class="mx-auto mb-8 elevated-card error-card"
            max-width="600"
            variant="elevated"
            elevation="8"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="orange" class="me-3">
                  mdi-bug
                </v-icon>
                <h2 class="text-h6 font-weight-bold">
                  Piada de Console
                </h2>
              </div>

              <div class="joke-text text-h6 mb-4">
                "{{ currentErrorJoke }}"
              </div>

              <v-divider class="my-4" />

              <div class="error-details">
                <p class="text-body-2 mb-2">
                  <strong>Status:</strong> 404 - Page Not Found
                </p>
                <p class="text-body-2 mb-2">
                  <strong>Rota solicitada:</strong> 
                  <code class="bg-grey-lighten-3 pa-1 rounded">{{ $route.fullPath }}</code>
                </p>
                <p class="text-body-2">
                  <strong>Timestamp:</strong> {{ timestamp }}
                </p>
              </div>
            </v-card-text>
          </v-card>

          <!-- Opções de navegação -->
          <v-card 
            class="mx-auto mb-8 navigation-card"
            max-width="500"
            variant="outlined"
          >
            <v-card-subtitle class="text-center pt-4">
              <v-icon class="me-2">mdi-compass</v-icon>
              Para onde você gostaria de ir?
            </v-card-subtitle>
            
            <v-card-text class="pa-4">
              <v-list>
                <v-list-item
                  v-for="route in availableRoutes"
                  :key="route.path"
                  @click="goTo(route.path)"
                  class="navigation-item"
                >
                  <template v-slot:prepend>
                    <v-icon :color="route.color">{{ route.icon }}</v-icon>
                  </template>
                  
                  <v-list-item-title>{{ route.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ route.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Botões de ação -->
          <div class="action-buttons">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              class="me-4 mb-4"
              @click="goHome"
            >
              <v-icon start>mdi-home</v-icon>
              Voltar ao Início
            </v-btn>

            <v-btn
              color="secondary"
              variant="outlined"
              size="large"
              class="me-4 mb-4"
              @click="goBack"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              Voltar
            </v-btn>

            <v-btn
              color="success"
              variant="outlined"
              size="large"
              class="mb-4"
              @click="reportBug"
            >
              <v-icon start>mdi-bug-outline</v-icon>
              Reportar Bug
            </v-btn>
          </div>

          <!-- Easter egg: contador de tentativas -->
          <div v-if="attempts > 3" class="easter-egg mt-6">
            <v-alert
              type="info"
              variant="tonal"
              class="mx-auto"
              max-width="400"
            >
              <div class="d-flex align-center">
                <v-icon class="me-2">mdi-lightbulb</v-icon>
                <div>
                  <strong>Easter Egg Desbloqueado!</strong>
                  <br>
                  <small>Você tentou {{ attempts }} URLs inválidas. Que persistência! 🏆</small>
                </div>
              </div>
            </v-alert>
          </div>

        </v-col>
      </v-row>
    </v-container>

    <!-- Partículas flutuantes de erro -->
    <div class="error-particles">
      <div 
        v-for="n in 20" 
        :key="n" 
        class="particle"
        :style="getParticleStyle(n)"
      >
        ❓
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const toast = useToast()

// Estados reativos
const attempts = ref(0)
const timestamp = ref('')

// Piadas sobre erros
const errorJokes = ref([
  "Por que o programador foi ao médico? Porque tinha um bug no sistema! 🐛",
  "404: Humor não encontrado... aguarde, carregando piada de backup! 😅",
  "Erro 404: Esta página foi para o mesmo lugar que as meias perdidas 🧦",
  "Como debuggar um relacionamento? Tentando 404 diferentes páginas! 💔",
  "Stack Overflow: Tentativas de achar esta página excederam o limite 📚",
  "Esta página está em outro castelo! 🏰",
  "ERRO: success.exe parou de funcionar 💥",
  "Console.log('Onde diabos estou?') 🤷‍♂️"
])

// Rotas disponíveis
const availableRoutes = ref([
  {
    path: '/inicial',
    title: 'Estado Inicial',
    description: 'Começar a jornada de humor',
    icon: 'mdi-emoticon-neutral',
    color: 'blue-grey'
  },
  {
    path: '/triste',
    title: 'Estado Triste',
    description: 'Experimentar a melancolia',
    icon: 'mdi-emoticon-sad',
    color: 'blue'
  },
  {
    path: '/poker-face',
    title: 'Poker Face',
    description: 'Buscar uma piada',
    icon: 'mdi-emoticon-cool',
    color: 'pink'
  },
  {
    path: '/feliz',
    title: 'Estado Feliz',
    description: 'Celebrar a felicidade',
    icon: 'mdi-emoticon-happy',
    color: 'yellow'
  }
])

// Computed
const currentErrorJoke = computed(() => {
  const index = Math.floor(Date.now() / 3000) % errorJokes.value.length
  return errorJokes.value[index]
})

// Methods
const goTo = (path) => {
  // Verificar se precisa de autenticação
  if (path !== '/login' && !userStore.isAuthenticated) {
    toast.warning('Você precisa fazer login primeiro!')
    router.push('/login')
    return
  }
  
  router.push(path)
}

const goHome = () => {
  if (userStore.isAuthenticated) {
    router.push('/inicial')
  } else {
    router.push('/login')
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    goHome()
  }
}

const reportBug = () => {
  const bugReport = {
    page: route.fullPath,
    timestamp: timestamp.value,
    userAgent: navigator.userAgent,
    authenticated: userStore.isAuthenticated
  }
  
  // Simular envio de bug report
  navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2))
    .then(() => {
      toast.success('Relatório de bug copiado para área de transferência!')
    })
    .catch(() => {
      toast.error('Erro ao copiar relatório de bug')
    })
}

const getParticleStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 5}s`,
    fontSize: `${0.8 + Math.random() * 0.4}rem`
  }
}

const trackAttempt = () => {
  const storedAttempts = localStorage.getItem('incuca_404_attempts')
  attempts.value = storedAttempts ? parseInt(storedAttempts) + 1 : 1
  localStorage.setItem('incuca_404_attempts', attempts.value.toString())
}

// Lifecycle
onMounted(() => {
  // Formatar timestamp
  timestamp.value = new Date().toLocaleString('pt-BR')
  
  // Rastrear tentativa
  trackAttempt()
  
  // Toast de boas-vindas ao erro
  setTimeout(() => {
    toast.error(`Ops! Você acabou de descobrir um buraco negro na web! 🕳️`)
  }, 500)
})
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.error-emoji-container {
  position: relative;
  margin-bottom: 2rem;
}

.error-emoji {
  font-size: 6rem;
  line-height: 1;
  display: block;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.05em;
}

.error-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.joke-text {
  font-style: italic;
  line-height: 1.4;
  color: #424242;
  background: rgba(245, 245, 245, 0.8);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.error-details {
  background: rgba(0, 0, 0, 0.05);
  padding: 16px;
  border-radius: 8px;
}

.navigation-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
}

.navigation-item {
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.navigation-item:hover {
  background: rgba(25, 118, 210, 0.1);
  transform: translateX(4px);
}

.easter-egg {
  animation: fadeInUp 0.6s ease;
}

/* Partículas de erro */
.error-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  color: rgba(255, 255, 255, 0.6);
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* Animações */
.animate-shake {
  animation: shake 2s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividade */
@media (max-width: 600px) {
  .error-emoji {
    font-size: 4rem;
  }
  
  .error-code {
    font-size: 5rem;
  }
  
  .display-1 {
    font-size: 2rem !important;
  }
  
  .action-buttons .v-btn {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
}

/* Efeitos nos botões */
.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
