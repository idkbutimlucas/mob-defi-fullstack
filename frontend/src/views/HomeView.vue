<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getStations, calculateRoute, type Station, type RouteResponse } from '@/api/client';

const stations = ref<Station[]>([]);
const loading = ref(false);
const loadingStations = ref(true);
const error = ref<string | null>(null);

const fromStation = ref<string | null>(null);
const toStation = ref<string | null>(null);
const analyticCode = ref<string | null>(null);

const analyticCodes = [
  { title: 'Passagers', value: 'PASSENGER' },
  { title: 'Fret', value: 'FREIGHT' },
  { title: 'Maintenance', value: 'MAINTENANCE' },
  { title: 'Service', value: 'SERVICE' },
];

const result = ref<RouteResponse | null>(null);

onMounted(async () => {
  try {
    stations.value = await getStations();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur lors du chargement des stations';
  } finally {
    loadingStations.value = false;
  }
});

async function submitForm() {
  if (!fromStation.value || !toStation.value || !analyticCode.value) {
    error.value = 'Veuillez remplir tous les champs';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    result.value = await calculateRoute({
      fromStationId: fromStation.value,
      toStationId: toStation.value,
      analyticCode: analyticCode.value,
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur lors du calcul du trajet';
  } finally {
    loading.value = false;
  }
}

function getStationName(id: string): string {
  const station = stations.value.find(s => s.id === id);
  return station ? station.name : id;
}
</script>

<template>
  <v-card>
    <v-card-title>
      <v-icon start>mdi-train</v-icon>
      Calculateur de Trajet
    </v-card-title>
    <v-card-text>
      <v-alert type="info" variant="tonal" class="mb-4">
        Sélectionnez une station de départ et d'arrivée pour calculer la distance.
      </v-alert>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
        {{ error }}
      </v-alert>

      <v-form @submit.prevent="submitForm">
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="fromStation"
              :items="stations"
              item-title="name"
              item-value="id"
              label="Station de départ"
              prepend-icon="mdi-map-marker"
              placeholder="Rechercher une station..."
              :loading="loadingStations"
              :disabled="loadingStations"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="toStation"
              :items="stations"
              item-title="name"
              item-value="id"
              label="Station d'arrivée"
              prepend-icon="mdi-map-marker-check"
              placeholder="Rechercher une station..."
              :loading="loadingStations"
              :disabled="loadingStations"
              clearable
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-select
              v-model="analyticCode"
              :items="analyticCodes"
              item-title="title"
              item-value="value"
              label="Code analytique"
              prepend-icon="mdi-tag"
              placeholder="Sélectionnez un type de trajet"
              clearable
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="text-center">
            <v-btn
              type="submit"
              color="primary"
              size="large"
              :loading="loading"
              :disabled="!fromStation || !toStation || !analyticCode"
            >
              <v-icon start>mdi-calculator</v-icon>
              Calculer le trajet
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <!-- Results -->
      <v-card v-if="result" class="mt-6" variant="outlined" color="success">
        <v-card-title>
          <v-icon start color="success">mdi-check-circle</v-icon>
          Résultat du calcul
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-map-marker</v-icon>
                  </template>
                  <v-list-item-title>Départ</v-list-item-title>
                  <v-list-item-subtitle>{{ getStationName(result.fromStationId) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-map-marker-check</v-icon>
                  </template>
                  <v-list-item-title>Arrivée</v-list-item-title>
                  <v-list-item-subtitle>{{ getStationName(result.toStationId) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-map-marker-distance</v-icon>
                  </template>
                  <v-list-item-title>Distance totale</v-list-item-title>
                  <v-list-item-subtitle class="text-h6 text-primary">
                    {{ result.distanceKm.toFixed(2) }} km
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-counter</v-icon>
                  </template>
                  <v-list-item-title>Nombre de stations</v-list-item-title>
                  <v-list-item-subtitle>{{ result.path.length }} stations</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 mb-2">Itinéraire:</div>
              <v-chip-group column>
                <v-chip
                  v-for="(stationId, index) in result.path"
                  :key="index"
                  size="small"
                  :color="index === 0 ? 'primary' : index === result.path.length - 1 ? 'success' : 'default'"
                >
                  {{ getStationName(stationId) }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>
