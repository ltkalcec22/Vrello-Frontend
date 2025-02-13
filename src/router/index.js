import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useApiService } from '../stores/apiService'
import { storeToRefs } from 'pinia';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        requiresAuth: false,
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        requiresAuth: false,
      }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUp.vue'),
      meta: {
        requiresAuth: false,
      }
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/TasksView.vue'),
      meta: {
        requiresAuth: true,
      }
    }
  ],
})



router.beforeEach(async (to, from) => {
  const apiService = useApiService();
  const { token } = storeToRefs(apiService);

  if (
    !token.value && to.name !== 'login' && to.meta.requiresAuth
  ) {
    return { name: 'login' }
  }
})

export default router
