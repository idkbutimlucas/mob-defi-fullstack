<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" />
      <v-toolbar-title>Train Routing - MOB</v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list nav>
        <v-list-item
          prepend-icon="mdi-train"
          title="Calculer un trajet"
          to="/"
        />
        <v-list-item
          prepend-icon="mdi-chart-bar"
          title="Statistiques"
          to="/stats"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>

    <v-footer app>
      <v-col class="text-center" cols="12">
        MOB - Montreux Oberland Bernois
      </v-col>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { ref } from 'vue'

export default {
  setup() {
    const drawer = ref(false)
    return { drawer }
  },
}
</script>
