<template>
  <div class="mood-container mood-poker-face">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" class="text-center">
          
          <!-- Emoji concentrado -->
          <div class="mood-emoji-container mb-6">
            <div 
              class="mood-emoji" 
              :class="{ 'loading': isLoadingJoke, 'anticipating': !isLoadingJoke && !showJoke }"
            >
              😑
            </div>
          </div>

          <!-- Estado de carregamento -->
          <div v-if="isLoadingJoke" class="loading-section animate-fade-in-up">
            <h1 class="display-1 font-weight-bold mb-4 text-white">
              Carregando Piada...
            </h1>
            
            <div class="loading-animation mb-6">
              <v-progress-circular
                indeterminate
                size="64"
                width="6"
                color="white"
                class="mb-4"
              />
              
              <p class="text-h6 text-pink-lighten-2">
                {{ currentLoadingMessage }}
              </p>
            </div>

            <!-- Barra de progresso fake para dramaturgia -->
            <v-card 
              class="mx-auto progress-card"
              max-width="400"
              variant="elevated"
              elevation="8"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-2">
                  <v-icon color="pink" class="me-2">mdi-download</v-icon>
                  <span class="text-subtitle-2">Baixando humor...</span>
                </div>
                <v-progress-linear
                  :model-value="loadingProgress"
                  color="pink"
                  height="8"
                  rounded
                  striped
                />
                <div class="text-caption mt-1 text-grey">
                  {{ Math.round(loadingProgress) }}% completo
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Estado de expectativa (após carregar) -->
          <div v-else-if="!showJoke && currentJoke" class="anticipation-section animate-fade-in-up">
            <h1 class="display-1 font-weight-bold mb-4 text-white">
              Poker Face Ativado
            </h1>
            
            <p class="text-h6 mb-6 text-pink-lighten-2">
              Piada carregada! Preparando apresentação épica... 🎭
            </p>

            <v-card 
              class="mx-auto anticipation-card elevated-card"
              max-width="600"
              variant="elevated"
              elevation="12"
            >
              <v-card-text class="pa-6">
                <div class="d-flex align-center mb-4">
                  <v-icon size="32" color="pink" class="me-3">
                    mdi-theater
                  </v-icon>
                  <h2 class="text-h6 font-weight-bold">
                    Preparando o Espetáculo
                  </h2>
                </div>

                <div class="preparation-steps">
                  <div 
                    v-for="(step, index) in preparationSteps" 
                    :key="index"
                    class="step-item"
                    :class="{ 'completed': index < currentStep }"
                  >
                    <v-icon 
                      :color="index < currentStep ? 'success' : 'grey'"
                      class="me-3"
                    >
                      {{ index < currentStep ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                    </v-icon>
                    <span :class="{ 'text-success': index < currentStep }">
                      {{ step }}
                    </span>
                  </div>
                </div>

                <v-btn
                  v-if="currentStep >= preparationSteps.length"
                  color="pink"
                  variant="elevated"
                  size="large"
                  block
                  class="mt-6 btn-glowing"
                  @click="revealJoke"
                >
                  <v-icon start>mdi-eye</v-icon>
                  Revelar Piada
                </v-btn>
              </v-card-text>
            </v-card>
          </div>

        </v-col>
      </v-row>
    </v-container>

    <!-- Modal da Piada -->
    <v-dialog
      v-model="showJoke"
      max-width="700"
      persistent
      transition="dialog-transition"
    >
      <v-card class="joke-modal elevated-card">
        <v-card-title class="d-flex align-center pa-6 bg-gradient">
          <v-icon size="32" color="white" class="me-3">
            mdi-emoticon-lol
          </v-icon>
          <span class="text-h5 font-weight-bold text-white">
            Hora da Piada! 🎉
          </span>
        </v-card-title>

        <v-card-text class="pa-8">
          <div class="joke-content">
            <!-- Emoji de risada -->
            <div class="text-center mb-6">
              <div class="joke-emoji animate-bounce">😄</div>
            </div>

            <!-- Texto da piada -->
            <div 
              class="joke-text text-h6 text-center mb-6"
              v-html="formattedJoke"
            ></div>

            <!-- Medidor de humor subindo -->
            <div class="happiness-meter">
              <div class="d-flex align-center mb-2">
                <v-icon color="orange" class="me-2">mdi-heart</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Nível de Felicidade</span>
              </div>
              <v-progress-linear
                :model-value="happinessLevel"
                color="orange"
                height="12"
                rounded
                striped
                class="mb-2"
              />
              <div class="text-caption text-orange">
                {{ happinessLevel }}% feliz! 📈
              </div>
            </div>

            <!-- Ações da piada -->
            <div class="joke-actions mt-6">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    block
                    @click="shareJoke"
                    :loading="isSharing"
                  >
                    <v-icon start>mdi-share</v-icon>
                    Compartilhar
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    :color="isFavorited ? 'red' : 'grey'"
                    variant="outlined"
                    block
                    @click="toggleFavorite"
                  >
                    <v-icon start>
                      {{ isFavorited ? 'mdi-heart' : 'mdi-heart-outline' }}
                    </v-icon>
                    {{ isFavorited ? 'Favoritada' : 'Favoritar' }}
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-center pa-6">
          <v-btn
            color="success"
            variant="elevated"
            size="large"
            :disabled="!canClose"
            @click="closeJoke"
            class="btn-close"
          >
            <v-icon start>mdi-check</v-icon>
            {{ canClose ? 'Estou Feliz! Fechar' : `Aguarde... ${timeToClose}s` }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Partículas de fundo -->
    <div class="particles-background">
      <div 
        v-for="n in 30" 
        :key="n" 
        class="particle"
        :style="getParticleStyle(n)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMoodStore } from '../stores/mood'
import { useJokeStore } from '../stores/joke'
import { useToast } from 'vue-toastification'

const router = useRouter()
const moodStore = useMoodStore()
const jokeStore = useJokeStore()
const toast = useToast()

// Estados reativos
const isLoadingJoke = ref(true)
const showJoke = ref(false)
const loadingProgress = ref(0)
const currentStep = ref(0)
const happinessLevel = ref(0)
const timeToClose = ref(5)
const canClose = ref(false)
const isSharing = ref(false)
const isFavorited = ref(false)

// Mensagens de carregamento
const loadingMessages = ref([
  "Conectando com a Matrix das piadas...",
  "Decodificando humor geek...",
  "Compilando risadas...",
  "Fazendo debug da tristeza...",
  "Executando algoritmo de felicidade...",
  "Carregando easter eggs...",
  "Instalando drivers de humor...",
  "Sincronizando com o servidor da alegria..."
])

const preparationSteps = ref([
  "Ajustando timing da piada",
  "Calibrando nível de geek",
  "Preparando efeitos sonoros",
  "Testando reações do público",
  "Finalizando apresentação"
])

// Computed
const currentLoadingMessage = computed(() => {
  const index = Math.floor(Date.now() / 1500) % loadingMessages.value.length
  return loadingMessages.value[index]
})

const currentJoke = computed(() => jokeStore.currentJoke)

const formattedJoke = computed(() => {
  if (!currentJoke.value) return ''
  
  // Destacar emojis e formatação básica
  return currentJoke.value
    .replace(/([😀-🙏])/g, '<span class="emoji-highlight">$1</span>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
})

// Methods
const loadJoke = async () => {
  try {
    isLoadingJoke.value = true
    
    // Simular progresso de carregamento
    const progressInterval = setInterval(() => {
      if (loadingProgress.value < 100) {
        loadingProgress.value += Math.random() * 15
      } else {
        clearInterval(progressInterval)
      }
    }, 200)

    // Buscar piada real
    await jokeStore.fetchRandomJoke()
    
    // Aguardar carregamento completo
    await new Promise(resolve => {
      const checkProgress = setInterval(() => {
        if (loadingProgress.value >= 100) {
          clearInterval(checkProgress)
          clearInterval(progressInterval)
          resolve()
        }
      }, 100)
    })

    isLoadingJoke.value = false
    
    // Simular preparação
    const stepInterval = setInterval(() => {
      if (currentStep.value < preparationSteps.value.length) {
        currentStep.value++
      } else {
        clearInterval(stepInterval)
      }
    }, 800)

  } catch (error) {
    console.error('Erro ao carregar piada:', error)
    toast.error('Erro ao carregar piada. Usando piada de backup!')
    isLoadingJoke.value = false
  }
}

const revealJoke = () => {
  showJoke.value = true
  
  // Iniciar contador de felicidade
  const happinessInterval = setInterval(() => {
    if (happinessLevel.value < 100) {
      happinessLevel.value += 2
    } else {
      clearInterval(happinessInterval)
    }
  }, 100)

  // Iniciar countdown para fechar
  const countdownInterval = setInterval(() => {
    timeToClose.value--
    if (timeToClose.value <= 0) {
      canClose.value = true
      clearInterval(countdownInterval)
    }
  }, 1000)
}

const closeJoke = () => {
  if (!canClose.value) return
  
  showJoke.value = false
  
  // Transição para feliz
  setTimeout(() => {
    router.push('/feliz')
  }, 500)
}

const shareJoke = async () => {
  try {
    isSharing.value = true
    const success = await jokeStore.shareJoke(currentJoke.value)
    if (success) {
      toast.success('Piada compartilhada/copiada!')
    } else {
      toast.error('Erro ao compartilhar piada')
    }
  } catch (error) {
    toast.error('Erro ao compartilhar piada')
  } finally {
    isSharing.value = false
  }
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  toast.success(isFavorited.value ? 'Adicionada aos favoritos!' : 'Removida dos favoritos!')
}

const getParticleStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 4}s`
  }
}

// Lifecycle
onMounted(() => {
  // Garantir mood correto
  moodStore.setMood('poker-face')
  
  // Iniciar carregamento
  setTimeout(() => {
    loadJoke()
  }, 1000)
})

// Watchers
watch(happinessLevel, (newLevel) => {
  if (newLevel >= 100) {
    // Quando atinge 100%, pode começar a fechar
    toast.success('Você está 100% feliz! 🎉')
  }
})
</script>

<style scoped>
.mood-container {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  overflow: hidden;
}

.mood-emoji {
  font-size: 8rem;
  line-height: 1;
  display: inline-block;
  transition: all 0.3s ease;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.mood-emoji.loading {
  animation: pulse 1.5s infinite;
}

.mood-emoji.anticipating {
  animation: anticipate 2s infinite;
}

@keyframes anticipate {
  0%, 100% { transform: scale(1) rotateZ(0deg); }
  25% { transform: scale(1.05) rotateZ(2deg); }
  50% { transform: scale(1.1) rotateZ(0deg); }
  75% { transform: scale(1.05) rotateZ(-2deg); }
}

.progress-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.anticipation-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.step-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.step-item.completed {
  transform: translateX(8px);
}

.joke-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bg-gradient {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.joke-emoji {
  font-size: 4rem;
  display: inline-block;
}

.joke-text {
  line-height: 1.6;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.emoji-highlight {
  font-size: 1.2em;
  margin: 0 2px;
}

.happiness-meter {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.btn-close {
  min-width: 200px;
  font-weight: bold;
}

/* Partículas de fundo */
.particles-background {
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
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
}

/* Responsividade */
@media (max-width: 600px) {
  .mood-emoji {
    font-size: 5rem;
  }
  
  .joke-emoji {
    font-size: 3rem;
  }
  
  .joke-text {
    padding: 16px;
    font-size: 1.1rem;
  }
}

/* Animações dos botões */
.btn-glowing {
  position: relative;
  overflow: hidden;
}

.btn-glowing::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-glowing:hover::before {
  left: 100%;
}
</style>
