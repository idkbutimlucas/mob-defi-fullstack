<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const drawer = ref(false)
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { title: 'Calculer un trajet', icon: 'mdi-train', to: '/' },
  { title: 'Statistiques', icon: 'mdi-chart-bar', to: '/stats' },
]

onMounted(() => {
  authStore.init()
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-app>
    <!-- Header minimaliste MOB -->
    <v-app-bar elevation="0" color="primary" class="app-header">
      <template #prepend>
        <v-app-bar-nav-icon
          variant="text"
          color="white"
          @click.stop="drawer = !drawer"
          class="d-md-none"
        />
        <div class="d-flex align-center ml-4">
          <div class="logo-container mr-3">
            <span class="logo-text">MOB</span>
          </div>
          <div class="d-none d-sm-block">
            <div class="text-body-2 text-white" style="opacity: 0.7">Montreux Oberland Bernois</div>
          </div>
        </div>
      </template>

      <!-- Navigation desktop -->
      <template #default>
        <v-spacer />
        <div class="d-none d-md-flex align-center">
          <v-btn
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            variant="text"
            color="white"
            :class="{ 'nav-active': route.path === item.to }"
            class="mx-1 nav-btn"
          >
            <v-icon start size="small">{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-btn>

          <v-divider vertical class="mx-3 my-4" style="opacity: 0.3" />

          <!-- Auth buttons -->
          <template v-if="authStore.isAuthenticated">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="text"
                  color="white"
                  class="nav-btn"
                >
                  <v-icon start size="small">mdi-account-circle</v-icon>
                  {{ authStore.user?.username }}
                  <v-icon end size="small">mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="handleLogout">
                  <template #prepend>
                    <v-icon>mdi-logout</v-icon>
                  </template>
                  <v-list-item-title>Deconnexion</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
          <template v-else>
            <v-btn
              to="/login"
              variant="text"
              color="white"
              class="nav-btn"
            >
              <v-icon start size="small">mdi-login</v-icon>
              Connexion
            </v-btn>
            <v-btn
              to="/signup"
              variant="outlined"
              color="white"
              class="nav-btn ml-2"
            >
              <v-icon start size="small">mdi-account-plus</v-icon>
              Inscription
            </v-btn>
          </template>
        </div>
      </template>
    </v-app-bar>

    <!-- Navigation drawer mobile -->
    <v-navigation-drawer v-model="drawer" temporary>
      <div class="pa-6 bg-primary">
        <div class="logo-container mb-2">
          <span class="logo-text">MOB</span>
        </div>
        <div class="text-body-2 text-white" style="opacity: 0.7">Montreux Oberland Bernois</div>
        <div v-if="authStore.isAuthenticated" class="text-body-2 text-white mt-2">
          <v-icon size="small" class="mr-1">mdi-account</v-icon>
          {{ authStore.user?.username }}
        </div>
      </div>

      <v-list nav class="pa-4">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          color="accent"
          class="mb-2"
          @click="drawer = false"
        />

        <v-divider class="my-4" />

        <template v-if="authStore.isAuthenticated">
          <v-list-item
            prepend-icon="mdi-logout"
            title="Deconnexion"
            rounded="lg"
            color="error"
            @click="handleLogout(); drawer = false"
          />
        </template>
        <template v-else>
          <v-list-item
            to="/login"
            prepend-icon="mdi-login"
            title="Connexion"
            rounded="lg"
            color="primary"
            class="mb-2"
            @click="drawer = false"
          />
          <v-list-item
            to="/signup"
            prepend-icon="mdi-account-plus"
            title="Inscription"
            rounded="lg"
            color="accent"
            @click="drawer = false"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenu principal -->
    <v-main class="main-content">
      <v-container class="py-8" style="max-width: 1000px">
        <RouterView />
      </v-container>
    </v-main>

    <!-- Footer minimaliste -->
    <v-footer class="footer-mob pa-6">
      <v-container style="max-width: 1000px">
        <div class="d-flex flex-column flex-md-row align-center justify-space-between">
          <div class="d-flex align-center mb-4 mb-md-0">
            <div class="logo-container logo-small mr-3">
              <span class="logo-text-small">MOB</span>
            </div>
            <div>
              <div class="text-body-2 font-weight-medium">MOB - GoldenPass</div>
              <div class="text-caption text-medium-emphasis">
                Compagnie du Chemin de fer Montreux Oberland bernois SA
              </div>
            </div>
          </div>
          <div class="text-caption text-medium-emphasis">Train Routing System v1.0</div>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<style scoped>
.app-header {
  transition: background-color 0.3s ease;
}

.logo-container {
  background: #e6007e;
  padding: 6px 12px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: 2px;
}

.logo-small {
  padding: 4px 8px;
}

.logo-text-small {
  font-size: 14px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

.nav-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  transition: all 0.2s ease;
}

.nav-active {
  background: rgba(255, 255, 255, 0.1) !important;
}

.main-content {
  background: #f1f1f1;
  min-height: 100vh;
}

.footer-mob {
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
