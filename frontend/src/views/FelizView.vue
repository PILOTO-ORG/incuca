<template>
  <div class="mood-container mood-happy" @click="handleScreenClick">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" class="text-center">
          
          <!-- Emoji super feliz com animações -->
          <div class="mood-emoji-container mb-6">
            <div 
              class="mood-emoji animate-bounce" 
              :class="{ 'super-happy': isEcstatic, 'celebrating': isCelebrating }"
            >
              😄
              <!-- Estrelas de felicidade -->
              <div class="happiness-particles">
                <div 
                  v-for="n in 8" 
                  :key="n"
                  class="star"
                  :style="getStarStyle(n)"
                >
                  ⭐
                </div>
              </div>
            </div>
          </div>

          <!-- Título vibrante -->
          <h1 class="display-1 font-weight-bold mb-4 text-white animate-fade-in-up rainbow-text">
            SUPER FELIZ! 🎉
          </h1>

          <!-- Frases motivacionais -->
          <p class="text-h5 mb-6 text-yellow-lighten-2 animate-pulse">
            {{ currentHappyQuote }}
          </p>

          <!-- Card de celebração -->
          <v-card 
            class="mx-auto mb-8 elevated-card celebration-card"
            max-width="700"
            variant="elevated"
            elevation="16"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-center mb-6">
                <v-icon size="48" color="yellow" class="me-3 animate-bounce">
                  mdi-trophy
                </v-icon>
                <h2 class="text-h4 font-weight-bold text-yellow-darken-2">
                  Missão Cumprida!
                </h2>
              </div>

              <!-- Estatísticas da jornada -->
              <div class="journey-stats mb-6">
                <v-row>
                  <v-col cols="6" md="3" class="text-center">
                    <div class="stat-circle bg-blue-lighten-2">
                      <v-icon size="24" color="white">mdi-emoticon-neutral</v-icon>
                    </div>
                    <div class="stat-label">Inicial</div>
                  </v-col>
                  <v-col cols="6" md="3" class="text-center">
                    <div class="stat-circle bg-blue-grey-darken-2">
                      <v-icon size="24" color="white">mdi-emoticon-sad</v-icon>
                    </div>
                    <div class="stat-label">Triste</div>
                  </v-col>
                  <v-col cols="6" md="3" class="text-center">
                    <div class="stat-circle bg-pink-darken-2">
                      <v-icon size="24" color="white">mdi-emoticon-cool</v-icon>
                    </div>
                    <div class="stat-label">Poker Face</div>
                  </v-col>
                  <v-col cols="6" md="3" class="text-center">
                    <div class="stat-circle bg-yellow-darken-2 animate-pulse">
                      <v-icon size="24" color="white">mdi-emoticon-happy</v-icon>
                    </div>
                    <div class="stat-label text-yellow-darken-2 font-weight-bold">Feliz!</div>
                  </v-col>
                </v-row>
              </div>

              <!-- Métricas de felicidade -->
              <div class="happiness-metrics">
                <div class="metric-item">
                  <v-icon color="green" class="me-2">mdi-heart</v-icon>
                  <span class="metric-label">Nível de Felicidade:</span>
                  <span class="metric-value">{{ happinessLevel }}%</span>
                </div>
                
                <div class="metric-item">
                  <v-icon color="orange" class="me-2">mdi-lightning-bolt</v-icon>
                  <span class="metric-label">Energia:</span>
                  <span class="metric-value">MÁXIMA!</span>
                </div>
                
                <div class="metric-item">
                  <v-icon color="purple" class="me-2">mdi-star</v-icon>
                  <span class="metric-label">Humor Geek:</span>
                  <span class="metric-value">{{ geekHumorLevel }}/10</span>
                </div>
              </div>

              <!-- Conquistas desbloqueadas -->
              <div class="achievements mt-6">
                <h3 class="text-h6 mb-4 text-center">
                  🏆 Conquistas Desbloqueadas
                </h3>
                <div class="achievement-grid">
                  <div 
                    v-for="achievement in achievements" 
                    :key="achievement.id"
                    class="achievement-badge"
                    :class="{ 'unlocked': achievement.unlocked }"
                  >
                    <v-icon size="24" :color="achievement.unlocked ? 'yellow' : 'grey'">
                      {{ achievement.icon }}
                    </v-icon>
                    <div class="achievement-text">
                      <div class="achievement-title">{{ achievement.title }}</div>
                      <div class="achievement-desc">{{ achievement.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Instruções para continuar -->
          <v-card 
            class="mx-auto instruction-card elevated-card"
            max-width="500"
            variant="tonal"
            color="yellow-darken-1"
          >
            <v-card-text class="pa-4 text-center">
              <v-icon size="32" color="amber-darken-3" class="mb-2">
                mdi-refresh
              </v-icon>
              <p class="mb-2 font-weight-bold text-amber-darken-4">
                Clique para recomeçar a jornada!
              </p>
              <p class="text-caption text-amber-darken-3">
                Volte ao estado inicial e viva tudo novamente 🔄
              </p>
            </v-card-text>
          </v-card>

          <!-- Botões de ação -->
          <div class="action-buttons mt-8">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              class="me-4 mb-4 btn-celebration"
              @click="restartJourney"
            >
              <v-icon start>mdi-restart</v-icon>
              Recomeçar Jornada
            </v-btn>

            <v-btn
              color="green"
              variant="outlined"
              size="large"
              class="me-4 mb-4"
              @click="shareExperience"
              :loading="isSharing"
            >
              <v-icon start>mdi-share</v-icon>
              Compartilhar
            </v-btn>

            <v-btn
              color="purple"
              variant="outlined"
              size="large"
              class="mb-4"
              @click="showStats"
            >
              <v-icon start>mdi-chart-line</v-icon>
              Ver Estatísticas
            </v-btn>
          </div>

        </v-col>
      </v-row>
    </v-container>

    <!-- Confetes e partículas de celebração -->
    <div class="celebration-particles">
      <div 
        v-for="n in 50" 
        :key="n" 
        class="confetti"
        :style="getConfettiStyle(n)"
      ></div>
    </div>

    <!-- Fogos de artifício -->
    <div class="fireworks">
      <div 
        v-for="n in 5" 
        :key="n"
        class="firework"
        :style="getFireworkStyle(n)"
      >
        🎆
      </div>
    </div>

    <!-- Dialog de estatísticas detalhadas -->
    <v-dialog v-model="showStatsDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">mdi-chart-box</v-icon>
          Estatísticas Detalhadas
        </v-card-title>
        
        <v-card-text>
          <div class="stats-detail">
            <div class="stat-row">
              <span>Tempo total da jornada:</span>
              <span class="font-weight-bold">{{ journeyTime }}</span>
            </div>
            <div class="stat-row">
              <span>Transições de humor:</span>
              <span class="font-weight-bold">{{ moodStats.totalTransitions }}</span>
            </div>
            <div class="stat-row">
              <span>Piadas visualizadas:</span>
              <span class="font-weight-bold">{{ jokeStats.jokesCount }}</span>
            </div>
            <div class="stat-row">
              <span>Nível de satisfação:</span>
              <span class="font-weight-bold text-green">EXCELENTE! 🌟</span>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showStatsDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const isEcstatic = ref(true)
const isCelebrating = ref(true)
const happinessLevel = ref(100)
const geekHumorLevel = ref(10)
const isSharing = ref(false)
const showStatsDialog = ref(false)
const journeyStartTime = ref(Date.now())

// Frases motivacionais felizes
const happyQuotes = ref([
  "Sucesso! O humor foi restaurado! 🎯",
  "Level up! Você dominou a arte da felicidade! 🆙",
  "Achievement unlocked: Master of Happiness! 🏆",
  "console.log('Felicidade máxima atingida!') ✨",
  "Commit bem-sucedido no repository da alegria! 🎉",
  "Debug completo: tristeza removida, felicidade instalada! 🔧",
  "Happiness.exe executando perfeitamente! 💻",
  "Easter egg encontrado: você descobriu a felicidade! 🥚"
])

const achievements = ref([
  {
    id: 1,
    title: "Primeiro Passo",
    description: "Iniciou a jornada do humor",
    icon: "mdi-play",
    unlocked: true
  },
  {
    id: 2,
    title: "Enfrentou a Tristeza",
    description: "Não desistiu no momento difícil",
    icon: "mdi-shield-check",
    unlocked: true
  },
  {
    id: 3,
    title: "Poker Face Master",
    description: "Manteve a compostura",
    icon: "mdi-cards-playing-outline",
    unlocked: true
  },
  {
    id: 4,
    title: "Happiness Achieved",
    description: "Alcançou o estado de felicidade máxima",
    icon: "mdi-trophy",
    unlocked: true
  },
  {
    id: 5,
    title: "Geek Humor Expert",
    description: "Apreciou uma piada verdadeiramente geek",
    icon: "mdi-brain",
    unlocked: true
  }
])

// Computed
const currentHappyQuote = computed(() => {
  const index = Math.floor(Date.now() / 2000) % happyQuotes.value.length
  return happyQuotes.value[index]
})

const moodStats = computed(() => moodStore.getMoodStats())
const jokeStats = computed(() => ({
  jokesCount: jokeStore.jokesCount
}))

const journeyTime = computed(() => {
  const elapsed = Date.now() - journeyStartTime.value
  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  return `${minutes}m ${seconds}s`
})

// Methods
const handleScreenClick = () => {
  // Efeito de celebração extra
  triggerCelebration()
  
  setTimeout(() => {
    restartJourney()
  }, 1000)
}

const triggerCelebration = () => {
  isCelebrating.value = true
  toast.success('🎉 INCRÍVEL! Você completou a jornada!')
  
  // Reset celebration após alguns segundos
  setTimeout(() => {
    isCelebrating.value = false
  }, 3000)
}

const restartJourney = () => {
  toast.info('Reiniciando jornada... 🔄')
  
  // Reset stats
  moodStore.resetMood()
  
  // Voltar ao inicial
  router.push('/inicial')
}

const shareExperience = async () => {
  try {
    isSharing.value = true
    
    const message = `🎉 Acabei de completar a jornada de humor no Incuca Geek Jokes! 
    
😐 → 😢 → 😑 → 😄

Descobri piadas incríveis e alcancei a felicidade máxima! 
Teste você também: ${window.location.origin}`

    if (navigator.share) {
      await navigator.share({
        title: 'Jornada de Humor Completa!',
        text: message,
        url: window.location.origin
      })
    } else {
      await navigator.clipboard.writeText(message)
      toast.success('Experiência copiada para área de transferência!')
    }
  } catch (error) {
    toast.error('Erro ao compartilhar experiência')
  } finally {
    isSharing.value = false
  }
}

const showStats = () => {
  showStatsDialog.value = true
}

const getStarStyle = (index) => {
  const angle = (index * 45) % 360
  const distance = 120 + (index % 3) * 20
  return {
    transform: `rotate(${angle}deg) translateY(-${distance}px)`,
    animationDelay: `${index * 0.2}s`
  }
}

const getConfettiStyle = (index) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7']
  return {
    left: `${Math.random() * 100}%`,
    backgroundColor: colors[index % colors.length],
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 2}s`
  }
}

const getFireworkStyle = (index) => {
  return {
    left: `${20 + (index * 20)}%`,
    animationDelay: `${index * 0.5}s`
  }
}

// Lifecycle
onMounted(() => {
  // Garantir mood correto
  moodStore.setMood('feliz')
  
  // Celebração inicial
  setTimeout(() => {
    triggerCelebration()
  }, 500)

  // Animação de chegada
  setTimeout(() => {
    toast.success('🎊 PARABÉNS! Você chegou ao final da jornada!')
  }, 1000)

  // Aumentar felicidade gradualmente para efeito visual
  const happinessInterval = setInterval(() => {
    if (happinessLevel.value < 100) {
      happinessLevel.value += 2
    } else {
      clearInterval(happinessInterval)
    }
  }, 50)
})

// Cleanup
onUnmounted(() => {
  // Cleanup se necessário
})
</script>

<style scoped>
.mood-container {
  min-height: 100vh;
  cursor: pointer;
  position: relative;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  overflow: hidden;
}

.mood-emoji {
  font-size: 8rem;
  line-height: 1;
  display: inline-block;
  transition: all 0.3s ease;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.mood-emoji.super-happy {
  animation: bounce 1s infinite, glow 2s infinite alternate;
}

.mood-emoji.celebrating {
  animation: celebrate 2s infinite;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(5deg); }
  50% { transform: scale(1.1) rotate(0deg); }
  75% { transform: scale(1.2) rotate(-5deg); }
}

@keyframes glow {
  0% { text-shadow: 0 0 20px rgba(255, 255, 0, 0.5); }
  100% { text-shadow: 0 0 30px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 255, 0, 0.6); }
}

.rainbow-text {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24, #f0932b);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rainbow 3s ease infinite;
}

@keyframes rainbow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.happiness-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.star {
  position: absolute;
  font-size: 1.5rem;
  animation: orbit 4s linear infinite;
}

@keyframes orbit {
  0% { transform: rotate(0deg) translateY(-120px) rotate(0deg); }
  100% { transform: rotate(360deg) translateY(-120px) rotate(-360deg); }
}

.celebration-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.journey-stats .stat-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  transition: all 0.3s ease;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.happiness-metrics {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.metric-label {
  margin-right: auto;
  margin-left: 8px;
}

.metric-value {
  font-weight: bold;
  color: #4caf50;
}

.achievement-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.achievement-badge {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(158, 158, 158, 0.1);
  transition: all 0.3s ease;
}

.achievement-badge.unlocked {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
}

.achievement-text {
  margin-left: 12px;
}

.achievement-title {
  font-weight: bold;
  font-size: 0.95rem;
}

.achievement-desc {
  font-size: 0.8rem;
  color: #666;
}

.instruction-card {
  background: rgba(255, 235, 59, 0.9);
  backdrop-filter: blur(5px);
}

/* Partículas de celebração */
.celebration-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  animation: confetti-fall linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100px) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotateZ(720deg);
    opacity: 0;
  }
}

.fireworks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.firework {
  position: absolute;
  top: 20%;
  font-size: 2rem;
  animation: firework-burst 3s infinite;
}

@keyframes firework-burst {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  15% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  50% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.8) rotate(540deg);
    opacity: 0;
  }
}

.stats-detail .stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-celebration {
  position: relative;
  overflow: hidden;
}

.btn-celebration::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s;
}

.btn-celebration:hover::before {
  left: 100%;
}

/* Responsividade */
@media (max-width: 600px) {
  .mood-emoji {
    font-size: 5rem;
  }
  
  .rainbow-text {
    font-size: 2rem !important;
  }
  
  .action-buttons .v-btn {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
  
  .achievement-grid {
    grid-template-columns: 1fr;
  }
}
</style>
