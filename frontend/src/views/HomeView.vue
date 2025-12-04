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
    { title: 'Passagers', value: 'PASSENGER', icon: 'mdi-account-group' },
    { title: 'Fret', value: 'FREIGHT', icon: 'mdi-package-variant' },
    { title: 'Maintenance', value: 'MAINTENANCE', icon: 'mdi-wrench' },
    { title: 'Service', value: 'SERVICE', icon: 'mdi-cog' },
  ]

  const customCode = ref('')
  const useCustomCode = ref(false)

  const result = ref<RouteResponse | null>(null)

  const effectiveAnalyticCode = computed(() => {
    if (useCustomCode.value && customCode.value.trim()) {
      return customCode.value.trim().toUpperCase()
    }
    return analyticCode.value
  })

  const isFormValid = computed(
    () =>
      fromStation.value &&
      toStation.value &&
      effectiveAnalyticCode.value &&
      fromStation.value !== toStation.value
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
        analyticCode: effectiveAnalyticCode.value!,
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
    <!-- Titre de page -->
    <div class="mb-8">
      <h1 class="text-h4 font-weight-bold mb-2">Calculateur de trajet</h1>
      <p class="text-body-1 text-medium-emphasis">
        Calculez la distance entre deux stations du reseau MOB
      </p>
    </div>

    <!-- Formulaire principal -->
    <v-card class="mb-6 card-elevated">
      <v-card-text class="pa-6 pa-md-8">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-6"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="submitForm">
          <!-- Selection des stations -->
          <div class="stations-grid">
            <div class="station-field">
              <label class="field-label">
                <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                Depart
              </label>
              <v-autocomplete
                v-model="fromStation"
                :items="stations"
                item-title="name"
                item-value="id"
                placeholder="Selectionner une station"
                :loading="loadingStations"
                :disabled="loadingStations"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
              />
            </div>

            <div class="swap-button-container">
              <v-btn
                icon
                variant="outlined"
                size="small"
                @click="swapStations"
                :disabled="!fromStation && !toStation"
              >
                <v-icon>mdi-swap-horizontal</v-icon>
              </v-btn>
            </div>

            <div class="station-field">
              <label class="field-label">
                <v-icon size="small" class="mr-1">mdi-flag-checkered</v-icon>
                Arrivee
              </label>
              <v-autocomplete
                v-model="toStation"
                :items="stations"
                item-title="name"
                item-value="id"
                placeholder="Selectionner une station"
                :loading="loadingStations"
                :disabled="loadingStations"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
              />
            </div>
          </div>

          <!-- Type de trajet -->
          <div class="mt-8">
            <label class="field-label mb-3">
              <v-icon size="small" class="mr-1">mdi-tag</v-icon>
              Type de trajet
            </label>
            <v-chip-group
              v-model="analyticCode"
              :mandatory="!useCustomCode"
              selected-class="chip-selected"
            >
              <v-chip
                v-for="code in analyticCodes"
                :key="code.value"
                :value="code.value"
                filter
                variant="outlined"
                size="large"
                class="chip-option"
                :disabled="useCustomCode"
                @click="useCustomCode = false"
              >
                <v-icon start size="small">{{ code.icon }}</v-icon>
                {{ code.title }}
              </v-chip>
            </v-chip-group>

            <div class="mt-4 d-flex align-center gap-3">
              <v-checkbox
                v-model="useCustomCode"
                label="Code personnalise"
                hide-details
                density="compact"
                @update:model-value="
                  (val: boolean | null) => {
                    if (val) analyticCode = null
                  }
                "
              />
              <v-text-field
                v-if="useCustomCode"
                v-model="customCode"
                placeholder="Ex: SPECIAL"
                hide-details
                density="compact"
                style="max-width: 200px"
              />
            </div>
          </div>

          <!-- Bouton de soumission -->
          <div class="mt-8">
            <v-btn
              type="submit"
              color="accent"
              size="large"
              :loading="loading"
              :disabled="!isFormValid"
              class="submit-btn"
            >
              <v-icon start>mdi-magnify</v-icon>
              Calculer l'itineraire
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Resultat -->
    <div v-if="result">
      <v-card class="result-card">
        <div class="result-header">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="text-overline" style="opacity: 0.7">Distance calculee</div>
              <div class="text-h3 font-weight-bold">{{ result.distanceKm.toFixed(2) }} km</div>
            </div>
            <v-chip color="white" variant="flat" size="large">
              <v-icon start>mdi-map-marker-path</v-icon>
              {{ result.path.length }} stations
            </v-chip>
          </div>
        </div>

        <v-card-text class="pa-6">
          <!-- Trajet simplifie - Design moderne -->
          <div class="route-overview">
            <div class="route-endpoints">
              <!-- Depart -->
              <div class="endpoint-card start">
                <div class="endpoint-icon">
                  <v-icon size="20">mdi-train</v-icon>
                </div>
                <div class="endpoint-details">
                  <span class="endpoint-label">Depart</span>
                  <span class="endpoint-station">{{ getStationName(result.fromStationId) }}</span>
                </div>
              </div>

              <!-- Ligne de connexion avec infos -->
              <div class="route-connection">
                <div class="connection-line">
                  <div class="connection-track"></div>
                  <div class="connection-dots">
                    <span
                      v-for="n in Math.min(5, result.path.length - 2)"
                      :key="n"
                      class="dot"
                    ></span>
                  </div>
                </div>
                <div class="connection-info">
                  <div class="info-badge">
                    <v-icon size="14">mdi-map-marker-multiple</v-icon>
                    <span>{{ result.path.length - 2 }} arrets</span>
                  </div>
                </div>
              </div>

              <!-- Arrivee -->
              <div class="endpoint-card end">
                <div class="endpoint-icon">
                  <v-icon size="20">mdi-flag-variant</v-icon>
                </div>
                <div class="endpoint-details">
                  <span class="endpoint-label">Arrivee</span>
                  <span class="endpoint-station">{{ getStationName(result.toStationId) }}</span>
                </div>
              </div>
            </div>
          </div>

          <v-divider class="mb-6" />

          <!-- Liste des stations - Timeline moderne -->
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="text-subtitle-2 font-weight-medium">Stations traversees</div>
            <v-chip size="small" variant="tonal" color="primary">
              <v-icon start size="small">mdi-map-marker-distance</v-icon>
              {{ result.distanceKm.toFixed(2) }} km total
            </v-chip>
          </div>

          <div class="journey-timeline">
            <div
              v-for="(stationId, index) in result.path"
              :key="index"
              class="timeline-item"
              :class="{
                'is-start': index === 0,
                'is-end': index === result.path.length - 1,
                'is-intermediate': index > 0 && index < result.path.length - 1,
              }"
            >
              <!-- Station row -->
              <div class="timeline-station">
                <div class="timeline-marker">
                  <div class="marker-icon">
                    <v-icon v-if="index === 0" size="16" color="white">mdi-play</v-icon>
                    <v-icon v-else-if="index === result.path.length - 1" size="16" color="white"
                      >mdi-flag-checkered</v-icon
                    >
                    <span v-else class="marker-number">{{ index }}</span>
                  </div>
                </div>
                <div class="station-info">
                  <span class="station-label">{{ getStationName(stationId) }}</span>
                  <span v-if="index === 0" class="station-badge start">Depart</span>
                  <span v-else-if="index === result.path.length - 1" class="station-badge end"
                    >Arrivee</span
                  >
                </div>
              </div>

              <!-- Distance segment (between stations) -->
              <div
                v-if="index < result.path.length - 1 && result.segmentDistances"
                class="timeline-segment"
              >
                <div class="segment-line">
                  <div class="segment-track"></div>
                </div>
                <div class="segment-info">
                  <div class="segment-distance-badge">
                    <v-icon size="12" class="mr-1">mdi-arrow-down</v-icon>
                    {{ result.segmentDistances[index]?.toFixed(2) }} km
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
  .card-elevated {
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .field-label {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #292929;
    margin-bottom: 8px;
  }

  .stations-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 16px;
    align-items: end;
  }

  @media (max-width: 768px) {
    .stations-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .swap-button-container {
      justify-self: center;
    }
  }

  .swap-button-container {
    display: flex;
    align-items: center;
    padding-bottom: 4px;
  }

  .chip-option {
    transition: all 0.2s ease;
  }

  .chip-selected {
    background: #e6007e !important;
    color: white !important;
    border-color: #e6007e !important;
  }

  .gap-3 {
    gap: 12px;
  }

  .submit-btn {
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0;
  }

  .result-card {
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .result-header {
    background: linear-gradient(135deg, #001f78 0%, #003399 100%);
    color: white;
    padding: 24px;
  }

  /* Route Overview - Modern Design */
  .route-overview {
    margin-bottom: 24px;
  }

  .route-endpoints {
    display: flex;
    align-items: stretch;
    gap: 0;
  }

  .endpoint-card {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 0;
    min-width: 180px;
  }

  .endpoint-card.start {
    background: linear-gradient(135deg, rgba(230, 0, 126, 0.08) 0%, rgba(230, 0, 126, 0.04) 100%);
    border: 1px solid rgba(230, 0, 126, 0.2);
  }

  .endpoint-card.end {
    background: linear-gradient(135deg, rgba(34, 139, 34, 0.08) 0%, rgba(34, 139, 34, 0.04) 100%);
    border: 1px solid rgba(34, 139, 34, 0.2);
  }

  .endpoint-icon {
    width: 44px;
    height: 44px;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .endpoint-card.start .endpoint-icon {
    background: linear-gradient(135deg, #e6007e 0%, #c00068 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(230, 0, 126, 0.25);
  }

  .endpoint-card.end .endpoint-icon {
    background: linear-gradient(135deg, #228b22 0%, #1a6b1a 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(34, 139, 34, 0.25);
  }

  .endpoint-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .endpoint-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.6;
  }

  .endpoint-card.start .endpoint-label {
    color: #e6007e;
  }

  .endpoint-card.end .endpoint-label {
    color: #228b22;
  }

  .endpoint-station {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.3;
  }

  /* Connection line between endpoints */
  .route-connection {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    min-width: 120px;
  }

  .connection-line {
    width: 100%;
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
  }

  .connection-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #e6007e 0%, #6b4c9a 50%, #228b22 100%);
    border-radius: 0;
    transform: translateY(-50%);
  }

  .connection-dots {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    z-index: 1;
  }

  .connection-dots .dot {
    width: 8px;
    height: 8px;
    background: white;
    border: 2px solid #6b4c9a;
    border-radius: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .connection-info {
    margin-top: 8px;
  }

  .info-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f5f5f5;
    padding: 6px 14px;
    border-radius: 0;
    font-size: 13px;
    font-weight: 500;
    color: #555;
  }

  .info-badge .v-icon {
    color: #6b4c9a;
  }

  @media (max-width: 768px) {
    .route-endpoints {
      flex-direction: column;
      gap: 0;
    }

    .endpoint-card {
      min-width: auto;
      border-radius: 0;
    }

    .endpoint-card.end {
      border-radius: 0;
    }

    .route-connection {
      padding: 16px 0;
      min-width: auto;
    }

    .connection-line {
      width: 4px;
      height: 40px;
      flex-direction: column;
    }

    .connection-track {
      width: 4px;
      height: 100%;
      left: 50%;
      top: 0;
      bottom: 0;
      right: auto;
      transform: translateX(-50%);
      background: linear-gradient(180deg, #e6007e 0%, #6b4c9a 50%, #228b22 100%);
    }

    .connection-dots {
      flex-direction: column;
      height: 100%;
    }
  }

  /* Journey Timeline */
  .journey-timeline {
    max-height: 450px;
    overflow-y: auto;
    padding-right: 8px;
  }

  .journey-timeline::-webkit-scrollbar {
    width: 6px;
  }

  .journey-timeline::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 0;
  }

  .journey-timeline::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 0;
  }

  .journey-timeline::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }

  .timeline-item {
    position: relative;
  }

  .timeline-station {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 0;
  }

  .timeline-marker {
    position: relative;
    z-index: 2;
  }

  .marker-icon {
    width: 32px;
    height: 32px;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    background: #e0e0e0;
    color: #666;
    transition: all 0.2s ease;
  }

  .is-start .marker-icon {
    background: linear-gradient(135deg, #e6007e 0%, #c00068 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(230, 0, 126, 0.3);
  }

  .is-end .marker-icon {
    background: linear-gradient(135deg, #228b22 0%, #1a6b1a 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(34, 139, 34, 0.3);
  }

  .is-intermediate .marker-icon {
    width: 24px;
    height: 24px;
    margin: 0 4px;
    background: #fff;
    border: 2px solid #001f78;
    color: #001f78;
    font-size: 10px;
  }

  .marker-number {
    font-size: inherit;
    font-weight: 600;
  }

  .station-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .station-label {
    font-size: 15px;
    color: #333;
  }

  .is-start .station-label,
  .is-end .station-label {
    font-weight: 600;
    font-size: 16px;
  }

  .station-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 8px;
    border-radius: 0;
  }

  .station-badge.start {
    background: rgba(230, 0, 126, 0.1);
    color: #e6007e;
  }

  .station-badge.end {
    background: rgba(34, 139, 34, 0.1);
    color: #228b22;
  }

  /* Distance segment between stations */
  .timeline-segment {
    display: flex;
    align-items: stretch;
    margin-left: 15px;
    padding: 4px 0;
  }

  .is-intermediate + .timeline-item .timeline-segment,
  .timeline-item:not(.is-start) .timeline-segment {
    margin-left: 15px;
  }

  .segment-line {
    width: 32px;
    display: flex;
    justify-content: center;
    position: relative;
  }

  .is-intermediate .segment-line {
    width: 24px;
    margin: 0 4px;
  }

  .segment-track {
    width: 3px;
    height: 100%;
    min-height: 24px;
    background: linear-gradient(180deg, #001f78 0%, #003399 100%);
    border-radius: 0;
    position: relative;
  }

  .segment-track::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 7px;
    height: 7px;
    background: #001f78;
    border-radius: 0;
    opacity: 0.3;
  }

  .segment-info {
    display: flex;
    align-items: center;
    padding-left: 16px;
  }

  .segment-distance-badge {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 1px solid #dee2e6;
    padding: 4px 12px;
    border-radius: 0;
    font-size: 12px;
    font-weight: 500;
    color: #495057;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .segment-distance-badge .v-icon {
    color: #001f78;
  }
</style>
