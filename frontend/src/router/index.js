import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useMoodStore } from '../stores/mood'

// Lazy loading das páginas
const LoginView = () => import('../views/LoginView.vue')
const InicialView = () => import('../views/InicialView.vue')
const TristeView = () => import('../views/TristeView.vue')
const PokerFaceView = () => import('../views/PokerFaceView.vue')
const FelizView = () => import('../views/FelizView.vue')
const NotFoundView = () => import('../views/NotFoundView.vue')

const routes = [
  {
    path: '/',
    redirect: '/inicial'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      title: 'Login - Incuca Geek Jokes'
    }
  },
  {
    path: '/inicial',
    name: 'inicial',
    component: InicialView,
    meta: {
      requiresAuth: true,
      mood: 'inicial',
      title: 'Inicial - Neutro 😐'
    }
  },
  {
    path: '/triste',
    name: 'triste',
    component: TristeView,
    meta: {
      requiresAuth: true,
      mood: 'triste',
      title: 'Triste - Melancólico 😢'
    }
  },
  {
    path: '/poker-face',
    name: 'poker-face',
    component: PokerFaceView,
    meta: {
      requiresAuth: true,
      mood: 'poker-face',
      title: 'Poker Face - Concentrado 😑'
    }
  },
  {
    path: '/feliz',
    name: 'feliz',
    component: FelizView,
    meta: {
      requiresAuth: true,
      mood: 'feliz',
      title: 'Feliz - Alegre 😄'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Página não encontrada'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guards de navegação
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const moodStore = useMoodStore()
  
  // Aguardar inicialização da autenticação
  if (!userStore.isInitialized) {
    await userStore.checkAuth()
  }
  
  // Verificar autenticação
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Redirecionar se já autenticado e tentando acessar login
  if (to.name === 'Login' && userStore.isAuthenticated) {
    next('/inicial')
    return
  }
  
  // Atualizar mood baseado na rota
  if (to.meta.mood) {
    moodStore.setMood(to.meta.mood)
  }
  
  // Atualizar título da página
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  next()
})

// After navigation
router.afterEach((to, from) => {
  // Analytics ou logs de navegação podem ir aqui
  if (import.meta.env.DEV) {
    console.log(`🧭 Navegou de ${from.name} para ${to.name}`)
  }
})

export default router
