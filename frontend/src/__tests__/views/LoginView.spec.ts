import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('Connexion')
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should have username and password fields', () => {
    const wrapper = mount(LoginView)

    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('should show link to signup page', () => {
    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('Pas encore de compte')
    expect(wrapper.text()).toContain('Creer un compte')
  })

  it('should call login on form submit', async () => {
    const wrapper = mount(LoginView)
    const store = useAuthStore()

    store.login = vi.fn().mockResolvedValue(undefined)

    // Set form values
    ;(wrapper.vm as any).username = 'testuser'
    ;(wrapper.vm as any).password = 'password123'
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(store.login).toHaveBeenCalledWith('testuser', 'password123')
  })

  it('should redirect to home on successful login', async () => {
    const wrapper = mount(LoginView)
    const store = useAuthStore()

    store.login = vi.fn().mockResolvedValue(undefined)
    ;(wrapper.vm as any).username = 'testuser'
    ;(wrapper.vm as any).password = 'password123'
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should display error message from store', async () => {
    const wrapper = mount(LoginView)
    const store = useAuthStore()

    store.error = 'Invalid credentials'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Invalid credentials')
  })

  it('should show loading state during login', async () => {
    const wrapper = mount(LoginView)
    const store = useAuthStore()

    store.isLoading = true
    await wrapper.vm.$nextTick()

    // Verify the store loading state is correctly set
    expect(store.isLoading).toBe(true)

    // When loading, input fields should be disabled
    const inputs = wrapper.findAll('input')
    inputs.forEach((input) => {
      expect(input.element.disabled).toBe(true)
    })
  })

  it('should toggle password visibility', async () => {
    const wrapper = mount(LoginView)

    // Initially password should be hidden
    expect((wrapper.vm as any).showPassword).toBe(false)

    // Toggle visibility
    ;(wrapper.vm as any).showPassword = true
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as any).showPassword).toBe(true)
  })

  it('should not redirect on login failure', async () => {
    const wrapper = mount(LoginView)
    const store = useAuthStore()

    store.login = vi.fn().mockRejectedValue(new Error('Login failed'))
    ;(wrapper.vm as any).username = 'testuser'
    ;(wrapper.vm as any).password = 'wrongpassword'
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockPush).not.toHaveBeenCalled()
  })
})
