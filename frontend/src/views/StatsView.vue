<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getStats, type StatsResponse, type GroupBy } from '@/api/client'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  type TooltipItem,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const fromDate = ref('')
const toDate = ref('')
const groupBy = ref<GroupBy>('none')
const stats = ref<StatsResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('chart')

const groupByOptions = [
  { title: 'Aucun', value: 'none', icon: 'mdi-view-list' },
  { title: 'Par jour', value: 'day', icon: 'mdi-calendar-today' },
  { title: 'Par mois', value: 'month', icon: 'mdi-calendar-month' },
  { title: 'Par annee', value: 'year', icon: 'mdi-calendar' },
]

const chartColors = {
  PASSENGER: { bg: 'rgba(200, 16, 46, 0.8)', border: '#C8102E' },
  FREIGHT: { bg: 'rgba(245, 124, 0, 0.8)', border: '#F57C00' },
  MAINTENANCE: { bg: 'rgba(2, 136, 209, 0.8)', border: '#0288D1' },
  SERVICE: { bg: 'rgba(26, 26, 46, 0.8)', border: '#1A1A2E' },
}

const barChartData = computed(() => {
  if (!stats.value || stats.value.items.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = stats.value.items.map((item) =>
    item.group ? `${item.analyticCode} (${item.group})` : item.analyticCode
  )

  const colors = stats.value.items.map((item) => {
    const colorKey = item.analyticCode as keyof typeof chartColors
    return chartColors[colorKey] || { bg: 'rgba(158, 158, 158, 0.8)', border: '#9E9E9E' }
  })

  return {
    labels,
    datasets: [
      {
        label: 'Distance totale (km)',
        data: stats.value.items.map((item) => item.totalDistanceKm),
        backgroundColor: colors.map((c) => c.bg),
        borderColor: colors.map((c) => c.border),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }
})

const doughnutChartData = computed(() => {
  if (!stats.value || stats.value.items.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Aggregate by analytic code
  const aggregated = stats.value.items.reduce(
    (acc, item) => {
      if (!acc[item.analyticCode]) {
        acc[item.analyticCode] = 0
      }
      acc[item.analyticCode] += item.totalDistanceKm
      return acc
    },
    {} as Record<string, number>
  )

  const labels = Object.keys(aggregated)
  const data = Object.values(aggregated)

  const colors = labels.map((label) => {
    const colorKey = label as keyof typeof chartColors
    return chartColors[colorKey] || { bg: 'rgba(158, 158, 158, 0.8)', border: '#9E9E9E' }
  })

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.map((c) => c.bg),
        borderColor: colors.map((c) => c.border),
        borderWidth: 2,
      },
    ],
  }
})

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'bar'>) => `${(context.parsed.y ?? 0).toFixed(2)} km`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Distance (km)',
      },
    },
  },
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'doughnut'>) => {
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
          const percentage = ((context.parsed / total) * 100).toFixed(1)
          return `${context.label}: ${context.parsed.toFixed(2)} km (${percentage}%)`
        },
      },
    },
  },
}

const totalDistance = computed(() => {
  if (!stats.value) return 0
  return stats.value.items.reduce((sum, item) => sum + item.totalDistanceKm, 0)
})

const totalRecords = computed(() => {
  if (!stats.value) return 0
  return stats.value.items.length
})

async function fetchStats() {
  loading.value = true
  error.value = null

  try {
    stats.value = await getStats({
      from: fromDate.value || undefined,
      to: toDate.value || undefined,
      groupBy: groupBy.value,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  await fetchStats()
}

function resetFilters() {
  fromDate.value = ''
  toDate.value = ''
  groupBy.value = 'none'
  fetchStats()
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <v-card class="mb-6 overflow-hidden" color="secondary" variant="flat">
      <v-card-text class="pa-8 text-center text-white">
        <v-icon size="64" class="mb-4" style="opacity: 0.9">mdi-chart-areaspline</v-icon>
        <h1 class="text-h4 font-weight-bold mb-2">Statistiques</h1>
        <p class="text-body-1" style="opacity: 0.9">
          Analysez les distances parcourues par code analytique
        </p>
      </v-card-text>
    </v-card>

    <!-- Filtres -->
    <v-card class="mb-6">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon class="mr-2" color="primary">mdi-filter</v-icon>
          <span class="text-h6">Filtres</span>
        </div>

        <form @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="fromDate"
                label="Date de debut"
                type="date"
                prepend-inner-icon="mdi-calendar-start"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="toDate"
                label="Date de fin"
                type="date"
                prepend-inner-icon="mdi-calendar-end"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="groupBy"
                label="Grouper par"
                :items="groupByOptions"
                item-title="title"
                item-value="value"
                prepend-inner-icon="mdi-group"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3" class="d-flex align-center gap-2">
              <v-btn type="submit" color="primary" :loading="loading" class="flex-grow-1">
                <v-icon start>mdi-magnify</v-icon>
                Appliquer
              </v-btn>
              <v-btn variant="outlined" @click="resetFilters" :disabled="loading">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </form>
      </v-card-text>
    </v-card>

    <!-- KPIs -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-text class="d-flex align-center pa-6">
            <v-avatar color="primary" size="56" class="mr-4">
              <v-icon color="white" size="28">mdi-map-marker-distance</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Distance totale</div>
              <div class="text-h4 font-weight-bold">{{ totalDistance.toFixed(2) }}</div>
              <div class="text-caption text-medium-emphasis">kilometres</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-text class="d-flex align-center pa-6">
            <v-avatar color="accent" size="56" class="mr-4">
              <v-icon color="white" size="28">mdi-counter</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Nombre d'entrees</div>
              <div class="text-h4 font-weight-bold">{{ totalRecords }}</div>
              <div class="text-caption text-medium-emphasis">enregistrements</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-text class="d-flex align-center pa-6">
            <v-avatar color="success" size="56" class="mr-4">
              <v-icon color="white" size="28">mdi-chart-pie</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Codes analytiques</div>
              <div class="text-h4 font-weight-bold">
                {{ new Set(stats?.items.map((i) => i.analyticCode) || []).size }}
              </div>
              <div class="text-caption text-medium-emphasis">categories</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Alertes -->
    <v-alert v-if="error" type="error" variant="tonal" class="mb-6" closable @click:close="error = null">
      {{ error }}
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-6" />

    <!-- Contenu principal -->
    <template v-if="stats && !loading">
      <v-alert v-if="stats.items.length === 0" type="info" variant="tonal" class="mb-6">
        <template #prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        Aucune donnee pour les filtres selectionnes. Essayez de calculer quelques trajets d'abord.
      </v-alert>

      <v-card v-else>
        <v-tabs v-model="activeTab" color="primary" class="border-b">
          <v-tab value="chart">
            <v-icon start>mdi-chart-bar</v-icon>
            Graphique en barres
          </v-tab>
          <v-tab value="doughnut">
            <v-icon start>mdi-chart-donut</v-icon>
            Repartition
          </v-tab>
          <v-tab value="table">
            <v-icon start>mdi-table</v-icon>
            Tableau
          </v-tab>
        </v-tabs>

        <v-card-text class="pa-6">
          <v-tabs-window v-model="activeTab">
            <!-- Graphique en barres -->
            <v-tabs-window-item value="chart">
              <div style="height: 400px">
                <Bar :data="barChartData" :options="barChartOptions" />
              </div>
            </v-tabs-window-item>

            <!-- Graphique donut -->
            <v-tabs-window-item value="doughnut">
              <div class="d-flex justify-center">
                <div style="height: 400px; width: 400px">
                  <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
                </div>
              </div>
            </v-tabs-window-item>

            <!-- Tableau -->
            <v-tabs-window-item value="table">
              <v-table hover>
                <thead>
                  <tr class="bg-grey-lighten-4">
                    <th class="text-left">Code Analytique</th>
                    <th class="text-right">Distance Totale</th>
                    <th v-if="groupBy !== 'none'" class="text-left">Periode</th>
                    <th class="text-right">Part</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in stats.items" :key="index">
                    <td>
                      <v-chip
                        :color="
                          item.analyticCode === 'PASSENGER'
                            ? 'primary'
                            : item.analyticCode === 'FREIGHT'
                              ? 'warning'
                              : item.analyticCode === 'MAINTENANCE'
                                ? 'info'
                                : 'secondary'
                        "
                        variant="flat"
                        size="small"
                      >
                        <v-icon start size="small">
                          {{
                            item.analyticCode === 'PASSENGER'
                              ? 'mdi-account-group'
                              : item.analyticCode === 'FREIGHT'
                                ? 'mdi-package-variant'
                                : item.analyticCode === 'MAINTENANCE'
                                  ? 'mdi-wrench'
                                  : 'mdi-cog'
                          }}
                        </v-icon>
                        {{ item.analyticCode }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <span class="font-weight-bold">{{ item.totalDistanceKm.toFixed(2) }}</span>
                      <span class="text-medium-emphasis"> km</span>
                    </td>
                    <td v-if="groupBy !== 'none'">
                      <v-chip size="small" variant="outlined">
                        {{ item.group }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <v-chip size="small" color="grey-lighten-2">
                        {{ ((item.totalDistanceKm / totalDistance) * 100).toFixed(1) }}%
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-grey-lighten-4 font-weight-bold">
                    <td>Total</td>
                    <td class="text-right">{{ totalDistance.toFixed(2) }} km</td>
                    <td v-if="groupBy !== 'none'"></td>
                    <td class="text-right">100%</td>
                  </tr>
                </tfoot>
              </v-table>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.gap-2 {
  gap: 8px;
}
</style>
