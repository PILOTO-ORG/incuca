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
            class="mx-auto stats-card elevated-card mb-6"
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
                  <div class="stat-number">{{ favoritesCount }}</div>
                  <div class="stat-label">Favoritos</div>
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

          <!-- Lista de Piadas Favoritas -->
          <v-card
            v-if="favorites.length > 0"
            class="mx-auto favorites-card elevated-card mb-6"
            max-width="800"
            variant="outlined"
          >
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2" color="warning">mdi-heart</v-icon>
              Suas Piadas Favoritas
              <v-spacer />
              <v-chip color="warning" variant="outlined" size="small">
                {{ favorites.length }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <div class="favorites-container">
                <v-card
                  v-for="(favorite, index) in displayFavorites"
                  :key="favorite.id"
                  class="favorite-joke-card mb-3"
                  variant="tonal"
                  :color="index % 2 === 0 ? 'primary' : 'secondary'"
                >
                  <v-card-text class="pa-4">
                    <div class="d-flex align-start">
                      <div class="flex-grow-1">
                        <p class="joke-text mb-3">{{ favorite.joke }}</p>
                        <div class="d-flex align-center justify-space-between">
                          <small class="text-caption text-medium-emphasis">
                            <v-icon size="16" class="me-1">mdi-clock</v-icon>
                            {{ formatDate(favorite.createdAt) }}
                          </small>
                          <div>
                            <v-btn
                              icon
                              size="small"
                              variant="text"
                              @click="shareJoke(favorite.joke)"
                              :loading="isSharing"
                            >
                              <v-icon>mdi-share</v-icon>
                            </v-btn>
                            <v-btn
                              icon
                              size="small"
                              variant="text"
                              color="error"
                              @click="removeFavorite(favorite.joke)"
                              :loading="isFavoriteLoading"
                            >
                              <v-icon>mdi-heart-off</v-icon>
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Botão para ver mais -->
                <div v-if="favorites.length > 3" class="text-center mt-4">
                  <v-btn
                    variant="outlined"
                    @click="showAllFavorites = !showAllFavorites"
                  >
                    <v-icon :class="{ 'rotate-180': showAllFavorites }">
                      mdi-chevron-down
                    </v-icon>
                    {{ showAllFavorites ? 'Ver menos' : `Ver todas (${favorites.length})` }}
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Card quando não há favoritos -->
          <v-card
            v-else-if="!isFavoriteLoading"
            class="mx-auto favorites-card elevated-card mb-6"
            max-width="600"
            variant="outlined"
          >
            <v-card-text class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-heart-outline
              </v-icon>
              <h3 class="text-h6 mb-2">Nenhuma piada favorita ainda</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Comece explorando os diferentes humores e favoritando as piadas que mais gosta!
              </p>
              <v-btn color="primary" variant="elevated" @click="goToSad">
                <v-icon start>mdi-emoticon-sad</v-icon>
                Explorar Piadas
              </v-btn>
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
              class="me-4 mb-4"
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
import { useJokeStore } from '../stores/joke'
import { useToast } from 'vue-toastification'

const router = useRouter()
const moodStore = useMoodStore()
const userStore = useUserStore()
const jokeStore = useJokeStore()
const toast = useToast()

// Estados reativos
const showInfo = ref(false)
const isShaking = ref(false)
const clickCount = ref(0)
const showAllFavorites = ref(false)
const isSharing = ref(false)
const encouragementMessages = ref([
  "Que tal uma mudança? 🤔",
  "Clique para descobrir o que acontece! ✨",
  "A tristeza é apenas um clique de distância... 😅",
  "Sua jornada emocional começa aqui! 🎭",
  "Nem todo herói usa capa... alguns só clicam! 🦸‍♂️"
])

// Computed
const moodStats = computed(() => moodStore.getMoodStats())
const favorites = computed(() => jokeStore.favorites)
const favoritesCount = computed(() => jokeStore.favoritesCount)
const isFavoriteLoading = computed(() => jokeStore.isFavoriteLoading)

const displayFavorites = computed(() => {
  if (showAllFavorites.value) {
    return favorites.value
  }
  return favorites.value.slice(0, 3)
})

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

const goToSad = async () => {
  try {
    await router.push('/triste')
  } catch (error) {
    console.error('Erro na navegação:', error)
  }
}

const shareJoke = async (joke) => {
  try {
    isSharing.value = true
    const success = await jokeStore.shareJoke(joke)
    
    if (success) {
      toast.success('WhatsApp aberto para compartilhar! 📱')
    } else {
      toast.error('Erro ao compartilhar piada')
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error)
    toast.error('Erro ao compartilhar piada')
  } finally {
    isSharing.value = false
  }
}

const removeFavorite = async (joke) => {
  try {
    const success = await jokeStore.removeFromFavorites(joke)
    
    if (success) {
      toast.success('Piada removida dos favoritos! 💔')
    } else {
      toast.error('Erro ao remover dos favoritos')
    }
  } catch (error) {
    console.error('Erro ao remover favorito:', error)
    toast.error('Erro ao remover dos favoritos')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return 'Hoje'
    } else if (diffDays === 2) {
      return 'Ontem'
    } else if (diffDays <= 7) {
      return `${diffDays} dias atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  } catch (error) {
    return 'Data inválida'
  }
}

// Lifecycle
onMounted(async () => {
  // Garantir que estamos no mood correto
  moodStore.setMood('inicial')
  
  // Carregar favoritos
  await jokeStore.fetchFavorites()
  
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

/* Estilos para favoritos */
.favorites-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.favorite-joke-card {
  transition: all 0.3s ease;
  border-radius: 12px !important;
}

.favorite-joke-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.joke-text {
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

.favorites-container {
  max-height: 400px;
  overflow-y: auto;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Animação para loading de favoritos */
.favorite-joke-card {
  animation: fadeInUp 0.3s ease forwards;
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
</style>
