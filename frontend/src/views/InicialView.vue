<template>
  <div class="mood-container mood-neutral" @click="handleScreenClick">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" class="text-center">
          
          <!-- Emoji gigante animado -->
          <div class="mood-emoji-container mb-8">
            <div 
              class="mood-emoji animate-pulse" 
              :class="{ 'animate-shake': isShaking }"
            >
              😐
            </div>
          </div>

          <!-- Título principal -->
          <h1 class="display-1 font-weight-bold mb-4 animate-fade-in-up">
            Estado Inicial
          </h1>

          <!-- Descrição -->
          <p class="text-h5 mb-8 text-medium-emphasis">
            Nem feliz, nem triste... apenas... existindo 🤷‍♂️
          </p>

          <!-- Card de instruções -->
          <v-card 
            class="mx-auto mb-8 elevated-card instruction-card"
            max-width="600"
            variant="elevated"
            elevation="8"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="info" class="me-3">
                  mdi-information
                </v-icon>
                <h2 class="text-h6 font-weight-bold">
                  Como funciona?
                </h2>
              </div>

              <div class="instruction-steps">
                <div class="step-item">
                  <v-icon color="primary" class="me-3">mdi-cursor-default-click</v-icon>
                  <span>Clique em qualquer lugar da tela</span>
                </div>
                <div class="step-item">
                  <v-icon color="warning" class="me-3">mdi-arrow-right</v-icon>
                  <span>Você ficará triste 😢</span>
                </div>
                <div class="step-item">
                  <v-icon color="success" class="me-3">mdi-emoticon-happy</v-icon>
                  <span>Continue clicando para melhorar o humor!</span>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Estatísticas do usuário -->
          <v-card 
            class="mx-auto stats-card elevated-card"
            max-width="400"
            variant="outlined"
          >
            <v-card-subtitle class="text-center pt-4">
              <v-icon class="me-2">mdi-chart-line</v-icon>
              Suas estatísticas
            </v-card-subtitle>
            
            <v-card-text>
              <v-row>
                <v-col cols="6" class="text-center">
                  <div class="stat-number">{{ moodStats.totalTransitions }}</div>
                  <div class="stat-label">Transições</div>
                </v-col>
                <v-col cols="6" class="text-center">
                  <div class="stat-number">{{ Math.round(moodStats.progression.percentage) }}%</div>
                  <div class="stat-label">Progresso</div>
                </v-col>
              </v-row>

              <!-- Barra de progresso do humor -->
              <v-progress-linear
                :model-value="moodStats.progression.percentage"
                color="primary"
                height="6"
                rounded
                class="mt-4"
              />
            </v-card-text>
          </v-card>

          <!-- Botões de ação -->
          <div class="action-buttons mt-8">
            <v-btn
              color="warning"
              variant="elevated"
              size="large"
              class="me-4 mb-4"
              @click="goToSad"
            >
              <v-icon start>mdi-emoticon-sad</v-icon>
              Ficar Triste
            </v-btn>

            <v-btn
              color="info"
              variant="outlined"
              size="large"
              class="mb-4"
              @click="showInfo = !showInfo"
            >
              <v-icon start>mdi-help-circle</v-icon>
              Mais Info
            </v-btn>
          </div>

          <!-- Dialog de informações -->
          <v-dialog v-model="showInfo" max-width="500">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon class="me-2">mdi-lightbulb</v-icon>
                Sobre este estado
              </v-card-title>
              
              <v-card-text>
                <p class="mb-4">
                  O estado <strong>Inicial</strong> representa a neutralidade emocional. 
                  É o ponto de partida da nossa jornada de humor.
                </p>
                
                <v-alert type="info" variant="tonal" class="mb-4">
                  <strong>Dica:</strong> Este é o estado padrão da aplicação. 
                  Sempre que você fecha uma modal de piada, volta para cá!
                </v-alert>

                <div class="d-flex align-center">
                  <v-icon color="neutral" class="me-2">mdi-emoticon-neutral</v-icon>
                  <span>Filosoficamente falando: "Eu penso, logo... meh." 🤔</span>
                </div>
              </v-card-text>
              
              <v-card-actions>
                <v-spacer />
                <v-btn @click="showInfo = false">Entendi</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        </v-col>
      </v-row>
    </v-container>

    <!-- Easter egg: click counter -->
    <div 
      v-if="clickCount > 5"
      class="click-counter"
    >
      <v-chip color="info" variant="elevated">
        <v-icon start>mdi-cursor-default-click</v-icon>
        {{ clickCount }} clicks!
      </v-chip>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMoodStore } from '../stores/mood'
import { useUserStore } from '../stores/user'
import { useToast } from 'vue-toastification'

const router = useRouter()
const moodStore = useMoodStore()
const userStore = useUserStore()
const toast = useToast()

// Estados reativos
const showInfo = ref(false)
const isShaking = ref(false)
const clickCount = ref(0)
const encouragementMessages = ref([
  "Que tal uma mudança? 🤔",
  "Clique para descobrir o que acontece! ✨",
  "A tristeza é apenas um clique de distância... 😅",
  "Sua jornada emocional começa aqui! 🎭",
  "Nem todo herói usa capa... alguns só clicam! 🦸‍♂️"
])

// Computed
const moodStats = computed(() => moodStore.getMoodStats())

// Methods
const handleScreenClick = () => {
  clickCount.value++
  
  // Adicionar efeito de shake
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 500)

  // Mostrar mensagem encorajadora ocasionalmente
  if (clickCount.value % 3 === 0) {
    const message = encouragementMessages.value[
      Math.floor(Math.random() * encouragementMessages.value.length)
    ]
    toast.info(message)
  }

  // Transição para triste após um pequeno delay
  setTimeout(() => {
    goToSad()
  }, 600)
}

const goToSad = () => {
  router.push('/triste')
}

// Lifecycle
onMounted(() => {
  // Garantir que estamos no mood correto
  moodStore.setMood('inicial')
  
  // Easter egg: mensagem de boas-vindas
  setTimeout(() => {
    toast.success(`Bem-vindo, ${userStore.user?.name}! 👋`)
  }, 1000)
})

onUnmounted(() => {
  // Cleanup se necessário
})
</script>

<style scoped>
.mood-container {
  min-height: 100vh;
  cursor: pointer;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  transition: all 0.3s ease;
}

.mood-container:hover {
  background: linear-gradient(135deg, #e8ebf0 0%, #b8c2db 100%);
}

.mood-emoji-container {
  perspective: 1000px;
}

.mood-emoji {
  font-size: 8rem;
  line-height: 1;
  display: inline-block;
  transition: all 0.3s ease;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mood-emoji:hover {
  transform: scale(1.1) rotateY(10deg);
}

.instruction-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.instruction-steps {
  text-align: left;
}

.step-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.step-item:last-child {
  margin-bottom: 0;
}

.stats-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #1976D2;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-buttons {
  perspective: 1000px;
}

.click-counter {
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 10;
  animation: fadeInUp 0.3s ease;
}

/* Animações customizadas */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
}

/* Efeitos de hover nos botões */
.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
