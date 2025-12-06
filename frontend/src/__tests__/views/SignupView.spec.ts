import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SignupView from '@/views/SignupView.vue'
import { useAuthStore } from '@/stores/auth'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SignupView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render signup form', () => {
    const wrapper = mount(SignupView)

    expect(wrapper.text()).toContain('Inscription')
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should have all required fields', () => {
    const wrapper = mount(SignupView)

    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(4) // username, email, password, confirmPassword
  })

  it('should show link to login page', () => {
    const wrapper = mount(SignupView)

    expect(wrapper.text()).toContain('Deja un compte')
    expect(wrapper.text()).toContain('Se connecter')
  })

  it('should call register on form submit', async () => {
    const wrapper = mount(SignupView)
    const store = useAuthStore()

    store.register = vi.fn().mockResolvedValue(undefined)
    ;(wrapper.vm as any).username = 'newuser'
    ;(wrapper.vm as any).email = 'new@example.com'
    ;(wrapper.vm as any).password = 'password123'
    ;(wrapper.vm as any).confirmPassword = 'password123'
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(store.register).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    })
  })

  it('should redirect to home on successful registration', async () => {
    const wrapper = mount(SignupView)
    const store = useAuthStore()

    store.register = vi.fn().mockResolvedValue(undefined)
    ;(wrapper.vm as any).username = 'newuser'
    ;(wrapper.vm as any).email = 'new@example.com'
    ;(wrapper.vm as any).password = 'password123'
    ;(wrapper.vm as any).confirmPassword = 'password123'
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should display error message on registration failure', async () => {
    const wrapper = mount(SignupView)
    const store = useAuthStore()

    store.register = vi.fn().mockRejectedValue(new Error('Username already exists'))
    ;(wrapper.vm as any).username = 'existinguser'
    ;(wrapper.vm as any).email = 'existing@example.com'
    ;(wrapper.vm as any).password = 'password123'
    ;(wrapper.vm as any).confirmPassword = 'password123'
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect((wrapper.vm as any).error).toBe('Username already exists')
  })

  it('should display field errors from API', async () => {
    const wrapper = mount(SignupView)
    const store = useAuthStore()

    const errorResponse = {
      errors: {
        username: 'Username is too short',
        email: 'Invalid email format',
      },
    }
    store.register = vi.fn().mockRejectedValue(new Error(JSON.stringify(errorResponse)))
    ;(wrapper.vm as any).username = 'ab'
    ;(wrapper.vm as any).email = 'invalid'
    ;(wrapper.vm as any).password = 'password123'
    ;(wrapper.vm as any).confirmPassword = 'password123'
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect((wrapper.vm as any).fieldErrors).toEqual(errorResponse.errors)
  })

  it('should show loading state during registration', async () => {
    const wrapper = mount(SignupView)
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
    const wrapper = mount(SignupView)

    expect((wrapper.vm as any).showPassword).toBe(false)
    ;(wrapper.vm as any).showPassword = true
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as any).showPassword).toBe(true)
  })

  it('should validate password match', () => {
    const wrapper = mount(SignupView)

    ;(wrapper.vm as any).password = 'password123'
    const rules = (wrapper.vm as any).rules

    expect(rules.passwordMatch('password123')).toBe(true)
    expect(rules.passwordMatch('differentpassword')).toBe('Les mots de passe ne correspondent pas')
  })

  it('should validate required fields', () => {
    const wrapper = mount(SignupView)
    const rules = (wrapper.vm as any).rules

    expect(rules.required('')).toBe('Ce champ est requis')
    expect(rules.required('value')).toBe(true)
  })

  it('should validate minimum length', () => {
    const wrapper = mount(SignupView)
    const rules = (wrapper.vm as any).rules

    const minLength3 = rules.minLength(3)
    expect(minLength3('ab')).toBe('Minimum 3 caracteres')
    expect(minLength3('abc')).toBe(true)
  })

  it('should validate email format', () => {
    const wrapper = mount(SignupView)
    const rules = (wrapper.vm as any).rules

    expect(rules.email('invalid')).toBe('Email invalide')
    expect(rules.email('valid@example.com')).toBe(true)
  })

  it('should not redirect on registration failure', async () => {
    const wrapper = mount(SignupView)
    const store = useAuthStore()

    store.register = vi.fn().mockRejectedValue(new Error('Registration failed'))
    ;(wrapper.vm as any).username = 'newuser'
    ;(wrapper.vm as any).email = 'new@example.com'
    ;(wrapper.vm as any).password = 'password123'
    ;(wrapper.vm as any).confirmPassword = 'password123'
    await wrapper.vm.$nextTick()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockPush).not.toHaveBeenCalled()
  })
})
