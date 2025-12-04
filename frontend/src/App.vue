<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const drawer = ref(false)
const route = useRoute()

const navItems = [
  { title: 'Calculer un trajet', icon: 'mdi-train', to: '/' },
  { title: 'Statistiques', icon: 'mdi-chart-bar', to: '/stats' },
]
</script>

<template>
  <v-app>
    <!-- Header moderne avec dégradé -->
    <v-app-bar elevation="0" class="app-header">
      <template #prepend>
        <v-app-bar-nav-icon
          variant="text"
          color="white"
          @click.stop="drawer = !drawer"
          class="d-md-none"
        />
        <div class="d-flex align-center ml-4">
          <v-icon size="32" color="white" class="mr-2">mdi-train-variant</v-icon>
          <div>
            <div class="text-h6 font-weight-bold text-white">MOB</div>
            <div class="text-caption text-white" style="opacity: 0.8; margin-top: -4px">
              GoldenPass
            </div>
          </div>
        </div>
      </template>

      <!-- Navigation desktop -->
      <template #default>
        <div class="d-none d-md-flex ml-8">
          <v-btn
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            variant="text"
            color="white"
            :class="{ 'nav-active': route.path === item.to }"
            class="mx-1"
          >
            <v-icon start>{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-btn>
        </div>
      </template>

      <template #append>
        <v-chip color="rgba(255,255,255,0.2)" text-color="white" size="small" class="mr-4">
          <v-icon start size="small">mdi-clock-outline</v-icon>
          {{ new Date().toLocaleDateString('fr-CH') }}
        </v-chip>
      </template>
    </v-app-bar>

    <!-- Navigation drawer mobile -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list-item class="pa-4 bg-primary">
        <template #prepend>
          <v-icon size="40" color="white">mdi-train-variant</v-icon>
        </template>
        <v-list-item-title class="text-h6 text-white">MOB</v-list-item-title>
        <v-list-item-subtitle class="text-white" style="opacity: 0.8">
          Montreux Oberland Bernois
        </v-list-item-subtitle>
      </v-list-item>

      <v-divider />

      <v-list nav class="pa-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          color="primary"
          class="mb-1"
        />
      </v-list>

      <template #append>
        <div class="pa-4">
          <v-divider class="mb-4" />
          <div class="text-caption text-medium-emphasis text-center">
            <v-icon size="small" class="mr-1">mdi-train</v-icon>
            Train Routing System
            <br />
            <span class="text-disabled">v1.0.0</span>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Contenu principal -->
    <v-main class="bg-grey-lighten-4">
      <!-- Bannière décorative -->
      <div class="rail-banner">
        <div class="rail-line" />
      </div>

      <v-container class="py-6" style="max-width: 1200px">
        <RouterView />
      </v-container>
    </v-main>

    <!-- Footer moderne -->
    <v-footer class="bg-secondary pa-4">
      <v-row justify="center" align="center" no-gutters>
        <v-col cols="auto" class="text-center">
          <div class="d-flex align-center justify-center mb-2">
            <v-icon color="primary" class="mr-2">mdi-train-variant</v-icon>
            <span class="text-white font-weight-medium">MOB - Montreux Oberland Bernois</span>
          </div>
          <div class="text-caption" style="color: rgba(255, 255, 255, 0.6)">
            Compagnie du Chemin de fer Montreux Oberland bernois SA
          </div>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #c8102e 0%, #8b0a1f 100%) !important;
}

.nav-active {
  background: rgba(255, 255, 255, 0.15) !important;
}

.rail-banner {
  height: 6px;
  background: linear-gradient(90deg, #c8102e 0%, #d4af37 50%, #c8102e 100%);
  position: relative;
  overflow: hidden;
}

.rail-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: repeating-linear-gradient(90deg, transparent, transparent 20px, #fff 20px, #fff 25px);
  transform: translateY(-50%);
  opacity: 0.3;
}
</style>
