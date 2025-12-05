import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
  logout as apiLogout,
  loadStoredToken,
  type User,
  type RegisterRequest,
} from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  async function init() {
    const token = loadStoredToken()
    if (token) {
      try {
        isLoading.value = true
        user.value = await getCurrentUser()
      } catch {
        apiLogout()
        user.value = null
      } finally {
        isLoading.value = false
      }
    }
  }

  async function login(username: string, password: string) {
    try {
      isLoading.value = true
      error.value = null
      await apiLogin(username, password)
      user.value = await getCurrentUser()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function register(request: RegisterRequest) {
    try {
      isLoading.value = true
      error.value = null
      const response = await apiRegister(request)
      // Auto-login after registration
      await apiLogin(request.username, request.password)
      user.value = await getCurrentUser()
      return response
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Registration failed'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    apiLogout()
    user.value = null
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    init,
    login,
    register,
    logout,
    clearError,
  }
})
