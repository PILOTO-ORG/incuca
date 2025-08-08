<template>
  <v-container 
    fluid 
    class="login-container d-flex align-center justify-center"
    :class="containerClass"
  >
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card 
          class="login-card elevated-card animate-fade-in-up"
          elevation="8"
          rounded="lg"
        >
          <!-- Header do card -->
          <v-card-title class="text-center pa-6">
            <div class="login-header">
              <v-avatar size="80" class="mb-4 animate-bounce">
                <v-icon size="48" color="primary">mdi-emoticon-happy</v-icon>
              </v-avatar>
              <h1 class="text-h4 font-weight-bold text-primary">
                Bem-vindo!
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis mt-2">
                Entre para descobrir piadas geek incríveis
              </p>
            </div>
          </v-card-title>

          <!-- Formulário -->
          <v-card-text class="pa-6">
            <v-form 
              ref="loginForm" 
              @submit.prevent="handleLogin"
              :disabled="isLoading"
            >
              <!-- Campo de email -->
              <v-text-field
                v-model="form.email"
                label="E-mail"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                :rules="emailRules"
                :error-messages="fieldErrors.email"
                autocomplete="email"
                class="mb-4"
                @input="clearFieldError('email')"
              />

              <!-- Campo de senha -->
              <v-text-field
                v-model="form.password"
                :label="passwordLabel"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="passwordRules"
                :error-messages="fieldErrors.password"
                autocomplete="current-password"
                class="mb-2"
                @click:append-inner="showPassword = !showPassword"
                @input="clearFieldError('password')"
              />

              <!-- Dica da senha -->
              <v-alert
                v-if="showPasswordHint"
                type="info"
                variant="tonal"
                class="mb-4 text-caption"
                closable
                @click:close="showPasswordHint = false"
              >
                <strong>Dica:</strong> A senha é bem específica e está descrita no teste 😉
              </v-alert>

              <!-- Mensagem de erro geral -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="clearError"
              >
                {{ error }}
              </v-alert>

              <!-- Botão de login -->
              <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                size="large"
                block
                class="mb-4 btn-glowing"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                <v-icon start>mdi-login</v-icon>
                Entrar
              </v-btn>

              <!-- Credenciais de teste -->
              <v-expansion-panels 
                variant="accordion"
                class="mb-4"
              >
                <v-expansion-panel
                  title="🧪 Credenciais de Teste"
                  text="Use essas credenciais para testar a aplicação"
                >
                  <template v-slot:text>
                    <div class="pa-4 bg-grey-lighten-5 rounded">
                      <p class="mb-2">
                        <strong>Email:</strong> 
                        <code class="bg-grey-lighten-2 pa-1 rounded">
                          cliente@incuca.com.br
                        </code>
                        <v-btn
                          icon="mdi-content-copy"
                          size="small"
                          variant="text"
                          @click="copyToClipboard('cliente@incuca.com.br')"
                        />
                      </p>
                      <p class="mb-2">
                        <strong>Senha:</strong> 
                        <small class="text-caption d-block">
                          (A senha secreta do teste... dica: pernas da mesa)
                        </small>
                      </p>
                      <v-btn
                        color="primary"
                        variant="outlined"
                        size="small"
                        @click="fillTestCredentials"
                        class="mt-2"
                      >
                        <v-icon start>mdi-auto-fix</v-icon>
                        Preencher automaticamente
                      </v-btn>
                    </div>
                  </template>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-form>
          </v-card-text>

          <!-- Footer -->
          <v-card-actions class="justify-center pa-6">
            <div class="text-center">
              <p class="text-caption text-medium-emphasis">
                Teste Fullstack - Incuca 2025
              </p>
              <div class="d-flex align-center justify-center mt-2">
                <v-icon size="small" class="me-1">mdi-heart</v-icon>
                <span class="text-caption">Feito com Vue.js & Node.js</span>
              </div>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useToast } from 'vue-toastification'

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

// Refs
const loginForm = ref(null)
const showPassword = ref(false)
const showPasswordHint = ref(false)
const isLoading = ref(false)
const error = ref('')

// Form data
const form = ref({
  email: '',
  password: ''
})

const fieldErrors = ref({
  email: [],
  password: []
})

// Validações
const emailRules = [
  v => !!v || 'E-mail é obrigatório',
  v => /.+@.+\..+/.test(v) || 'E-mail deve ter um formato válido'
]

const passwordRules = [
  v => !!v || 'Senha é obrigatória',
  v => (v && v.length >= 8) || 'Senha deve ter pelo menos 8 caracteres'
]

// Computed
const passwordLabel = computed(() => {
  const charCount = form.value.password.length
  return charCount > 0 ? `Senha (${charCount} caracteres)` : 'Senha'
})

const isFormValid = computed(() => {
  return form.value.email && 
         form.value.password && 
         /.+@.+\..+/.test(form.value.email) && 
         form.value.password.length >= 8
})

const containerClass = computed(() => {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'bg-gradient-day' : 'bg-gradient-night'
})

// Methods
const handleLogin = async () => {
  try {
    // Validar formulário
    const { valid } = await loginForm.value.validate()
    if (!valid) return

    isLoading.value = true
    error.value = ''
    
    await userStore.login({
      email: form.value.email.toLowerCase().trim(),
      password: form.value.password
    })

    toast.success('Login realizado com sucesso! 🎉')
    
    // Redirecionar para a página inicial
    router.push('/inicial')

  } catch (err) {
    console.error('Erro no login:', err)
    
    // Tratar erros específicos
    if (err.response?.status === 422 && err.response.data.errors) {
      // Erros de validação
      const errors = err.response.data.errors
      errors.forEach(error => {
        if (fieldErrors.value[error.field]) {
          fieldErrors.value[error.field] = [error.message]
        }
      })
    } else if (err.response?.status === 401) {
      error.value = 'Credenciais inválidas. Verifique seu e-mail e senha.'
      showPasswordHint.value = true
    } else if (err.response?.status === 429) {
      error.value = 'Muitas tentativas de login. Aguarde alguns minutos.'
    } else {
      error.value = err.userMessage || 'Erro ao fazer login. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}

const clearError = () => {
  error.value = ''
}

const clearFieldError = (field) => {
  if (fieldErrors.value[field]) {
    fieldErrors.value[field] = []
  }
}

const fillTestCredentials = () => {
  form.value.email = 'cliente@incuca.com.br'
  form.value.password = 'seumamesapossuirtrespernaschamadasqualidadeprecobaixoevelocidadeelaseriacapenga'
  
  toast.info('Credenciais de teste preenchidas!')
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência!')
  } catch (err) {
    toast.error('Erro ao copiar texto')
  }
}

// Lifecycle
onMounted(() => {
  // Se já estiver autenticado, redirecionar
  if (userStore.isAuthenticated) {
    router.push('/inicial')
  }
  
  // Focar no campo de email
  setTimeout(() => {
    const emailField = document.querySelector('input[type="email"]')
    if (emailField) emailField.focus()
  }, 100)
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.bg-gradient-day {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}

.bg-gradient-night {
  background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
}

.elevated-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.elevated-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

/* Animação para o avatar */
.animate-bounce {
  animation: bounce 2s infinite;
}

/* Efeito no botão */
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

/* Responsividade */
@media (max-width: 600px) {
  .login-card {
    margin: 16px;
  }
}
</style>
