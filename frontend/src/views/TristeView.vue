<template>
  <div class="mood-container mood-sad" @click="handleScreenClick">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" class="text-center">
          
          <!-- Emoji gigante animado com lágrimas -->
          <div class="mood-emoji-container mb-8">
            <div 
              class="mood-emoji" 
              :class="{ 'animate-shake': isShaking, 'crying': isCrying }"
            >
              😢
              <!-- Lágrimas animadas -->
              <div class="tears">
                <div class="tear tear-1">💧</div>
                <div class="tear tear-2">💧</div>
              </div>
            </div>
          </div>

          <!-- Título melancólico -->
          <h1 class="display-1 font-weight-bold mb-4 text-white animate-fade-in-up">
            Estado Triste
          </h1>

          <!-- Frase melancólica -->
          <p class="text-h5 mb-8 text-blue-grey-lighten-2 italic">
            "{{ currentSadQuote }}" 😔
          </p>

          <!-- Card de lamentações -->
          <v-card 
            class="mx-auto mb-8 elevated-card melancholy-card"
            max-width="650"
            variant="elevated"
            elevation="12"
            color="blue-grey-darken-4"
          >
            <v-card-text class="pa-6 text-white">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="blue-lighten-2" class="me-3">
                  mdi-weather-rainy
                </v-icon>
                <h2 class="text-h6 font-weight-bold">
                  Reflexões Melancólicas
                </h2>
              </div>

              <div class="sad-thoughts">
                <div 
                  v-for="(thought, index) in sadThoughts" 
                  :key="index"
                  class="thought-item animate-fade-in-up"
                  :style="{ animationDelay: `${index * 0.2}s` }"
                >
                  <v-icon color="blue-grey-lighten-1" class="me-3" size="small">
                    mdi-circle-small
                  </v-icon>
                  <span>{{ thought }}</span>
                </div>
              </div>

              <!-- Contador de tristeza -->
              <div class="sadness-meter mt-6">
                <div class="d-flex align-center mb-2">
                  <v-icon color="blue-lighten-2" class="me-2">mdi-heart-broken</v-icon>
                  <span class="text-subtitle-2">Nível de Tristeza</span>
                </div>
                <v-progress-linear
                  :model-value="sadnessLevel"
                  color="blue-lighten-2"
                  height="8"
                  rounded
                  striped
                  class="mb-2"
                />
                <div class="text-caption text-blue-grey-lighten-2">
                  {{ sadnessLevel }}% melancólico 📉
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Instruções para prosseguir -->
          <v-card 
            class="mx-auto instruction-card elevated-card"
            max-width="500"
            variant="tonal"
            color="blue-grey-darken-3"
          >
            <v-card-text class="pa-4 text-center text-white">
              <v-icon size="24" color="yellow-lighten-2" class="mb-2">
                mdi-lightbulb-on
              </v-icon>
              <p class="mb-2 font-weight-medium">
                Clique na tela para buscar uma piada
              </p>
              <p class="text-caption text-blue-grey-lighten-2">
                Talvez uma risada ajude a melhorar o humor? 🤔
              </p>
            </v-card-text>
          </v-card>

          <!-- Botões de ação -->
          <div class="action-buttons mt-8">
            <v-btn
              color="yellow-darken-2"
              variant="elevated"
              size="large"
              class="me-4 mb-4"
              @click="seekJoke"
              :loading="isTransitioning"
            >
              <v-icon start>mdi-emoticon-cool</v-icon>
              Buscar Piada
            </v-btn>

            <v-btn
              color="blue-grey-lighten-2"
              variant="outlined"
              size="large"
              class="mb-4"
              @click="goBack"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              Voltar ao Inicial
            </v-btn>
          </div>

        </v-col>
      </v-row>
    </v-container>

    <!-- Partículas de chuva de fundo -->
    <div class="rain-background">
      <div 
        v-for="n in 50" 
        :key="n" 
        class="raindrop"
        :style="getRainStyle(n)"
      ></div>
    </div>

    <!-- Som ambiente (opcional) -->
    <audio 
      v-if="playSadMusic" 
      ref="sadAudio" 
      loop 
      autoplay 
      volume="0.3"
    >
      <!-- Aqui poderia ter um arquivo de som ambiente -->
    </audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMoodStore } from '../stores/mood'
import { useToast } from 'vue-toastification'

const router = useRouter()
const moodStore = useMoodStore()
const toast = useToast()

// Estados reativos
const isShaking = ref(false)
const isCrying = ref(true)
const isTransitioning = ref(false)
const clickCount = ref(0)
const sadnessLevel = ref(85)
const playSadMusic = ref(false)

// Frases melancólicas rotativas
const sadQuotes = ref([
  "A vida é como um código... às vezes não compila 💻",
  "Até as lágrimas têm bugs 🐛",
  "Debugging the heart... error 404: happiness not found",
  "Stack overflow de sentimentos",
  "Meu coração está em modo maintenance",
  "console.log('Por que a vida é tão complicada?')",
  "Recompilando a felicidade... aguarde",
  "Git commit -m 'sadness intensifies'"
])

const sadThoughts = ref([
  "Por que arrays começam em 0 e minha felicidade não?",
  "Minha motivação está comentada no código",
  "Tentando dar push na felicidade mas o repository rejeita",
  "404: Satisfação não encontrada",
  "Meu humor está em loop infinito de tristeza",
  "Fazendo rollback para um estado menos melancólico"
])

// Computed
const currentSadQuote = computed(() => {
  const index = Math.floor(Date.now() / 3000) % sadQuotes.value.length
  return sadQuotes.value[index]
})

// Methods
const handleScreenClick = () => {
  clickCount.value++
  
  // Efeito de shake
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 600)

  // Feedback ao usuário
  if (clickCount.value === 1) {
    toast.info("Buscando uma piada para alegrar você... 🔍")
  } else if (clickCount.value > 3) {
    toast.warning("Calma! Uma piada por vez! 😅")
    return
  }

  // Transição para poker-face
  setTimeout(() => {
    seekJoke()
  }, 800)
}

const seekJoke = () => {
  if (isTransitioning.value) return
  
  isTransitioning.value = true
  
  // Reduzir tristeza gradualmente
  const interval = setInterval(() => {
    if (sadnessLevel.value > 20) {
      sadnessLevel.value -= 5
    } else {
      clearInterval(interval)
    }
  }, 100)

  setTimeout(() => {
    router.push('/poker-face')
  }, 1500)
}

const goBack = () => {
  router.push('/inicial')
}

const getRainStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${1 + Math.random() * 2}s`
  }
}

// Lifecycle
onMounted(() => {
  // Garantir que estamos no mood correto
  moodStore.setMood('triste')
  
  // Animação inicial
  setTimeout(() => {
    toast.error("Oh não! Você ficou triste... 😢")
  }, 500)

  // Aumentar tristeza gradualmente
  const sadnessInterval = setInterval(() => {
    if (sadnessLevel.value < 95) {
      sadnessLevel.value += 1
    } else {
      clearInterval(sadnessInterval)
    }
  }, 200)

  // Limpar interval quando sair da página
  onUnmounted(() => {
    clearInterval(sadnessInterval)
  })
})

// Watchers
watch(sadnessLevel, (newLevel) => {
  if (newLevel > 90) {
    isCrying.value = true
  } else if (newLevel < 30) {
    isCrying.value = false
  }
})
</script>

<style scoped>
.mood-container {
  min-height: 100vh;
  cursor: pointer;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.mood-emoji-container {
  position: relative;
  perspective: 1000px;
}

.mood-emoji {
  font-size: 8rem;
  line-height: 1;
  display: inline-block;
  transition: all 0.3s ease;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
}

.mood-emoji:hover {
  transform: scale(1.05) rotateX(10deg);
}

.tears {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.tear {
  position: absolute;
  font-size: 1.5rem;
  animation: falling 2s infinite;
}

.tear-1 {
  left: -20px;
  animation-delay: 0s;
}

.tear-2 {
  left: 20px;
  animation-delay: 1s;
}

.crying .tear {
  animation-play-state: running;
}

@keyframes falling {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(100px) scale(0.5);
    opacity: 0;
  }
}

.melancholy-card {
  background: rgba(69, 90, 100, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.thought-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 1rem;
  line-height: 1.4;
}

.sadness-meter {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.instruction-card {
  background: rgba(55, 71, 79, 0.8) !important;
  backdrop-filter: blur(5px);
}

/* Animação de chuva */
.rain-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.raindrop {
  position: absolute;
  width: 2px;
  height: 10px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
  animation: rain linear infinite;
}

@keyframes rain {
  0% {
    transform: translateY(-100px);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

/* Efeitos especiais */
.animate-shake {
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(-8px) translateY(-4px); }
  50% { transform: translateX(8px) translateY(4px); }
  75% { transform: translateX(-4px) translateY(-2px); }
}

/* Responsividade */
@media (max-width: 600px) {
  .mood-emoji {
    font-size: 5rem;
  }
  
  .display-1 {
    font-size: 2.5rem !important;
  }
  
  .action-buttons .v-btn {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
  
  .tear {
    font-size: 1rem;
  }
}

/* Efeitos nos botões */
.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Efeito de fade-in escalonado */
.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}
</style>
