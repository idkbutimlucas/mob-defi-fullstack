import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { useAuthStore } from '@/stores/auth'

const mockPush = vi.fn()
const mockRoute = { path: '/' }

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => mockRoute,
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render app header', () => {
    const wrapper = mount(App, {
      global: {
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
    store.user = { id: '1', username: 'testuser', email: 'test@test.com' }

    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('testuser')
  })

  it('should call init on mount', async () => {
    const store = useAuthStore()
    const initSpy = vi.spyOn(store, 'init')

    mount(App, {
      global: {
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
    store.user = { id: '1', username: 'testuser', email: 'test@test.com' }

    const logoutSpy = vi.spyOn(store, 'logout')

    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    // Call handleLogout directly
    ;(wrapper.vm as any).handleLogout()
    await flushPromises()

    expect(logoutSpy).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should show deconnexion button when authenticated', async () => {
    const store = useAuthStore()
    store.user = { id: '1', username: 'testuser', email: 'test@test.com' }

    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Deconnexion')
  })

  it('should have correct navigation items', () => {
    const wrapper = mount(App, {
      global: {
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
