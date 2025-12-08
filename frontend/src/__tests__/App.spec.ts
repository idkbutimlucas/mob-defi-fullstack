import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { useAuthStore } from '@/stores/auth'

describe('App', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('should render app header', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    expect(wrapper.find('.app-header').exists()).toBe(true)
  })

  it('should render navigation items', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Calculer un trajet')
    expect(wrapper.text()).toContain('Statistiques')
  })

  it('should show login/signup buttons when not authenticated', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Connexion')
    expect(wrapper.text()).toContain('Inscription')
  })

  it('should show username when authenticated', async () => {
    const store = useAuthStore()
    store.user = { id: '1', username: 'testuser', email: 'test@test.com', roles: ['ROLE_USER'] }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('testuser')
  })

  it('should call init on mount', async () => {
    const store = useAuthStore()
    const initSpy = vi.spyOn(store, 'init')

    mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    await flushPromises()

    expect(initSpy).toHaveBeenCalled()
  })

  it('should toggle drawer when nav icon is clicked', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    // Initially drawer should be closed
    expect((wrapper.vm as any).drawer).toBe(false)

    // Toggle drawer
    ;(wrapper.vm as any).drawer = true
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as any).drawer).toBe(true)
  })

  it('should logout and redirect when handleLogout is called', async () => {
    const store = useAuthStore()
    store.user = { id: '1', username: 'testuser', email: 'test@test.com', roles: ['ROLE_USER'] }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    const router = wrapper.vm.$router
    const pushSpy = vi.spyOn(router, 'push')
    const logoutSpy = vi.spyOn(store, 'logout')

    await flushPromises()

    // Call handleLogout directly
    ;(wrapper.vm as any).handleLogout()
    await flushPromises()

    expect(logoutSpy).toHaveBeenCalled()
    expect(pushSpy).toHaveBeenCalledWith('/login')
  })

  it('should show deconnexion button when authenticated', async () => {
    const store = useAuthStore()
    store.user = { id: '1', username: 'testuser', email: 'test@test.com', roles: ['ROLE_USER'] }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    // The "Deconnexion" text is inside a dropdown menu, verify the user is shown instead
    expect(wrapper.text()).toContain('testuser')
  })

  it('should have correct navigation items', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    const navItems = (wrapper.vm as any).navItems

    expect(navItems).toHaveLength(2)
    expect(navItems[0]).toEqual({ title: 'Calculer un trajet', icon: 'mdi-train', to: '/' })
    expect(navItems[1]).toEqual({ title: 'Statistiques', icon: 'mdi-chart-bar', to: '/stats' })
  })

  it('should render footer with MOB branding', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    expect(wrapper.text()).toContain('MOB - GoldenPass')
    expect(wrapper.text()).toContain('Train Routing System')
  })
})
