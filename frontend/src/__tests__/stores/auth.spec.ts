import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as api from '@/api/client'

vi.mock('@/api/client', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  loadStoredToken: vi.fn(),
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have null user initially', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })

    it('should not be loading initially', () => {
      const store = useAuthStore()
      expect(store.isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const store = useAuthStore()
      expect(store.error).toBeNull()
    })

    it('should not be authenticated initially', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('init', () => {
    it('should load user when token exists', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' }
      vi.mocked(api.loadStoredToken).mockReturnValue('valid-token')
      vi.mocked(api.getCurrentUser).mockResolvedValue(mockUser)

      const store = useAuthStore()
      await store.init()

      expect(api.loadStoredToken).toHaveBeenCalled()
      expect(api.getCurrentUser).toHaveBeenCalled()
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should not load user when no token exists', async () => {
      vi.mocked(api.loadStoredToken).mockReturnValue(null)

      const store = useAuthStore()
      await store.init()

      expect(api.loadStoredToken).toHaveBeenCalled()
      expect(api.getCurrentUser).not.toHaveBeenCalled()
      expect(store.user).toBeNull()
    })

    it('should logout and clear user on getCurrentUser error', async () => {
      vi.mocked(api.loadStoredToken).mockReturnValue('invalid-token')
      vi.mocked(api.getCurrentUser).mockRejectedValue(new Error('Unauthorized'))

      const store = useAuthStore()
      await store.init()

      expect(api.logout).toHaveBeenCalled()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should set isLoading during init', async () => {
      vi.mocked(api.loadStoredToken).mockReturnValue('token')
      vi.mocked(api.getCurrentUser).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: '1', username: 'test', email: 'test@test.com' }), 10)
          )
      )

      const store = useAuthStore()
      const initPromise = store.init()

      expect(store.isLoading).toBe(true)
      await initPromise
      expect(store.isLoading).toBe(false)
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' }
      vi.mocked(api.login).mockResolvedValue('jwt-token')
      vi.mocked(api.getCurrentUser).mockResolvedValue(mockUser)

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      expect(api.login).toHaveBeenCalledWith('testuser', 'password123')
      expect(api.getCurrentUser).toHaveBeenCalled()
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(store.error).toBeNull()
    })

    it('should set error on login failure', async () => {
      vi.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'))

      const store = useAuthStore()

      await expect(store.login('wrong', 'password')).rejects.toThrow('Invalid credentials')
      expect(store.error).toBe('Invalid credentials')
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should set isLoading during login', async () => {
      vi.mocked(api.login).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('token'), 10))
      )
      vi.mocked(api.getCurrentUser).mockResolvedValue({
        id: '1',
        username: 'test',
        email: 'test@test.com',
      })

      const store = useAuthStore()
      const loginPromise = store.login('user', 'pass')

      expect(store.isLoading).toBe(true)
      await loginPromise
      expect(store.isLoading).toBe(false)
    })

    it('should clear previous error on new login attempt', async () => {
      vi.mocked(api.login).mockRejectedValueOnce(new Error('First error'))

      const store = useAuthStore()
      await expect(store.login('user', 'pass')).rejects.toThrow()
      expect(store.error).toBe('First error')

      vi.mocked(api.login).mockResolvedValueOnce('token')
      vi.mocked(api.getCurrentUser).mockResolvedValueOnce({
        id: '1',
        username: 'test',
        email: 'test@test.com',
      })

      await store.login('user', 'pass')
      expect(store.error).toBeNull()
    })
  })

  describe('register', () => {
    it('should register and auto-login successfully', async () => {
      const mockUser = { id: '1', username: 'newuser', email: 'new@example.com' }
      vi.mocked(api.register).mockResolvedValue({
        message: 'User registered successfully',
        user: { id: '1', username: 'newuser', email: 'new@example.com' },
      })
      vi.mocked(api.login).mockResolvedValue('jwt-token')
      vi.mocked(api.getCurrentUser).mockResolvedValue(mockUser)

      const store = useAuthStore()
      await store.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      })

      expect(api.register).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      })
      expect(api.login).toHaveBeenCalledWith('newuser', 'password123')
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should set error on registration failure', async () => {
      vi.mocked(api.register).mockRejectedValue(new Error('Username already exists'))

      const store = useAuthStore()

      await expect(
        store.register({
          username: 'existing',
          email: 'test@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Username already exists')

      expect(store.error).toBe('Username already exists')
      expect(store.user).toBeNull()
    })

    it('should set isLoading during registration', async () => {
      vi.mocked(api.register).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  message: 'User registered successfully',
                  user: { id: '1', username: 'test', email: 'test@test.com' },
                }),
              10
            )
          )
      )
      vi.mocked(api.login).mockResolvedValue('token')
      vi.mocked(api.getCurrentUser).mockResolvedValue({
        id: '1',
        username: 'test',
        email: 'test@test.com',
      })

      const store = useAuthStore()
      const registerPromise = store.register({
        username: 'test',
        email: 'test@test.com',
        password: 'pass',
      })

      expect(store.isLoading).toBe(true)
      await registerPromise
      expect(store.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and call api logout', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' }
      vi.mocked(api.login).mockResolvedValue('token')
      vi.mocked(api.getCurrentUser).mockResolvedValue(mockUser)

      const store = useAuthStore()
      await store.login('testuser', 'password')
      expect(store.isAuthenticated).toBe(true)

      store.logout()

      expect(api.logout).toHaveBeenCalled()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('clearError', () => {
    it('should clear error', async () => {
      vi.mocked(api.login).mockRejectedValue(new Error('Some error'))

      const store = useAuthStore()
      await expect(store.login('user', 'pass')).rejects.toThrow()
      expect(store.error).toBe('Some error')

      store.clearError()
      expect(store.error).toBeNull()
    })
  })
})
