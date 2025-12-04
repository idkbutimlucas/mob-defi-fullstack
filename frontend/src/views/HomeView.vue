<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getStations, calculateRoute, type Station, type RouteResponse } from '@/api/client'

const stations = ref<Station[]>([])
const loading = ref(false)
const loadingStations = ref(true)
const error = ref<string | null>(null)

const fromStation = ref<string | null>(null)
const toStation = ref<string | null>(null)
const analyticCode = ref<string | null>(null)

const analyticCodes = [
  { title: 'Passagers', value: 'PASSENGER', icon: 'mdi-account-group', color: 'primary' },
  { title: 'Fret', value: 'FREIGHT', icon: 'mdi-package-variant', color: 'warning' },
  { title: 'Maintenance', value: 'MAINTENANCE', icon: 'mdi-wrench', color: 'info' },
  { title: 'Service', value: 'SERVICE', icon: 'mdi-cog', color: 'secondary' },
]

const result = ref<RouteResponse | null>(null)

const isFormValid = computed(
  () => fromStation.value && toStation.value && analyticCode.value && fromStation.value !== toStation.value
)

onMounted(async () => {
  try {
    stations.value = await getStations()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur lors du chargement des stations'
  } finally {
    loadingStations.value = false
  }
})

async function submitForm() {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs correctement'
    return
  }

  loading.value = true
  error.value = null
  result.value = null

  try {
    result.value = await calculateRoute({
      fromStationId: fromStation.value!,
      toStationId: toStation.value!,
      analyticCode: analyticCode.value!,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur lors du calcul du trajet'
  } finally {
    loading.value = false
  }
}

function getStationName(id: string): string {
  const station = stations.value.find((s) => s.id === id)
  return station ? station.name : id
}

function swapStations() {
  const temp = fromStation.value
  fromStation.value = toStation.value
  toStation.value = temp
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <v-card class="mb-6 overflow-hidden" color="primary" variant="flat">
      <div class="hero-pattern">
        <v-card-text class="pa-8 text-center text-white">
          <v-icon size="64" class="mb-4" style="opacity: 0.9">mdi-train</v-icon>
          <h1 class="text-h4 font-weight-bold mb-2">Calculateur de Trajet</h1>
          <p class="text-body-1" style="opacity: 0.9">
            Calculez la distance optimale entre deux stations du reseau MOB
          </p>
        </v-card-text>
      </div>
    </v-card>

    <!-- Formulaire principal -->
    <v-card class="mb-6">
      <v-card-text class="pa-6">
        <v-alert v-if="error" type="error" variant="tonal" class="mb-6" closable @click:close="error = null">
          <template #prepend>
            <v-icon>mdi-alert-circle</v-icon>
          </template>
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="submitForm">
          <!-- Sélection des stations -->
          <v-row align="center">
            <v-col cols="12" md="5">
              <div class="station-card pa-4 rounded-lg">
                <div class="d-flex align-center mb-3">
                  <v-avatar color="primary" size="36" class="mr-3">
                    <v-icon color="white" size="20">mdi-ray-start</v-icon>
                  </v-avatar>
                  <span class="text-subtitle-1 font-weight-medium">Depart</span>
                </div>
                <v-autocomplete
                  v-model="fromStation"
                  :items="stations"
                  item-title="name"
                  item-value="id"
                  label="Station de depart"
                  placeholder="Rechercher..."
                  :loading="loadingStations"
                  :disabled="loadingStations"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                />
              </div>
            </v-col>

            <v-col cols="12" md="2" class="text-center">
              <v-btn icon variant="tonal" color="primary" size="large" @click="swapStations" :disabled="!fromStation && !toStation">
                <v-icon>mdi-swap-horizontal</v-icon>
                <v-tooltip activator="parent" location="top">Inverser</v-tooltip>
              </v-btn>
            </v-col>

            <v-col cols="12" md="5">
              <div class="station-card pa-4 rounded-lg">
                <div class="d-flex align-center mb-3">
                  <v-avatar color="success" size="36" class="mr-3">
                    <v-icon color="white" size="20">mdi-ray-end</v-icon>
                  </v-avatar>
                  <span class="text-subtitle-1 font-weight-medium">Arrivee</span>
                </div>
                <v-autocomplete
                  v-model="toStation"
                  :items="stations"
                  item-title="name"
                  item-value="id"
                  label="Station d'arrivee"
                  placeholder="Rechercher..."
                  :loading="loadingStations"
                  :disabled="loadingStations"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                />
              </div>
            </v-col>
          </v-row>

          <!-- Type de trajet -->
          <v-row class="mt-6">
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-medium mb-3">
                <v-icon class="mr-2">mdi-tag</v-icon>
                Type de trajet
              </div>
              <v-chip-group v-model="analyticCode" mandatory selected-class="bg-primary text-white">
                <v-chip
                  v-for="code in analyticCodes"
                  :key="code.value"
                  :value="code.value"
                  filter
                  variant="outlined"
                  size="large"
                  class="px-4"
                >
                  <v-icon start>{{ code.icon }}</v-icon>
                  {{ code.title }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>

          <!-- Bouton de soumission -->
          <v-row class="mt-6">
            <v-col cols="12" class="text-center">
              <v-btn
                type="submit"
                color="primary"
                size="x-large"
                :loading="loading"
                :disabled="!isFormValid"
                class="px-8"
              >
                <v-icon start>mdi-map-marker-distance</v-icon>
                Calculer l'itineraire
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Résultat -->
    <v-slide-y-transition>
      <v-card v-if="result" class="result-card">
        <div class="result-header pa-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar color="white" size="48" class="mr-4">
                <v-icon color="success" size="28">mdi-check-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 text-white font-weight-bold">Itineraire calcule</div>
                <div class="text-body-2" style="opacity: 0.9">
                  {{ result.path.length }} stations
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-h4 font-weight-bold text-white">{{ result.distanceKm.toFixed(2) }}</div>
              <div class="text-body-2" style="opacity: 0.9">kilometres</div>
            </div>
          </div>
        </div>

        <v-card-text class="pa-6">
          <!-- Trajet visuel -->
          <div class="route-visual mb-6">
            <div class="route-line" />
            <div class="d-flex justify-space-between align-center position-relative">
              <div class="route-point route-start">
                <v-avatar color="primary" size="48">
                  <v-icon color="white">mdi-train</v-icon>
                </v-avatar>
                <div class="mt-2 text-center">
                  <div class="text-caption text-medium-emphasis">Depart</div>
                  <div class="text-subtitle-2 font-weight-medium">
                    {{ getStationName(result.fromStationId) }}
                  </div>
                </div>
              </div>

              <div class="route-info text-center">
                <v-chip color="accent" variant="flat" class="px-4">
                  <v-icon start size="small">mdi-map-marker-path</v-icon>
                  {{ result.path.length - 2 }} arrets
                </v-chip>
              </div>

              <div class="route-point route-end">
                <v-avatar color="success" size="48">
                  <v-icon color="white">mdi-flag-checkered</v-icon>
                </v-avatar>
                <div class="mt-2 text-center">
                  <div class="text-caption text-medium-emphasis">Arrivee</div>
                  <div class="text-subtitle-2 font-weight-medium">
                    {{ getStationName(result.toStationId) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <v-divider class="mb-4" />

          <!-- Liste des stations -->
          <div class="text-subtitle-2 font-weight-medium mb-3">
            <v-icon class="mr-2" size="small">mdi-format-list-bulleted</v-icon>
            Stations traversees
          </div>

          <div class="stations-timeline">
            <div
              v-for="(stationId, index) in result.path"
              :key="index"
              class="station-item d-flex align-center mb-2"
            >
              <div class="station-marker" :class="{
                'station-start': index === 0,
                'station-end': index === result.path.length - 1,
                'station-middle': index > 0 && index < result.path.length - 1
              }">
                <div class="marker-dot" />
                <div v-if="index < result.path.length - 1" class="marker-line" />
              </div>
              <v-chip
                :color="index === 0 ? 'primary' : index === result.path.length - 1 ? 'success' : 'default'"
                :variant="index === 0 || index === result.path.length - 1 ? 'flat' : 'outlined'"
                size="small"
                class="ml-3"
              >
                {{ getStationName(stationId) }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>
  </div>
</template>

<style scoped>
.hero-pattern {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E");
}

.station-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
}

.result-card {
  overflow: hidden;
}

.result-header {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  color: white;
}

.route-visual {
  position: relative;
  padding: 20px 0;
}

.route-line {
  position: absolute;
  top: 50%;
  left: 60px;
  right: 60px;
  height: 4px;
  background: linear-gradient(90deg, #c8102e, #d4af37, #2e7d32);
  border-radius: 2px;
  transform: translateY(-50%);
}

.route-point {
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.route-info {
  z-index: 1;
}

.stations-timeline {
  max-height: 300px;
  overflow-y: auto;
}

.station-marker {
  position: relative;
  width: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dee2e6;
  border: 2px solid #adb5bd;
  z-index: 1;
}

.station-start .marker-dot {
  background: #c8102e;
  border-color: #c8102e;
}

.station-end .marker-dot {
  background: #2e7d32;
  border-color: #2e7d32;
}

.marker-line {
  position: absolute;
  top: 12px;
  width: 2px;
  height: 24px;
  background: #dee2e6;
}
</style>
