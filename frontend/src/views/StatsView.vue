<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { getStats, type StatsResponse, type GroupBy } from '@/api/client'
  import { useAuthStore } from '@/stores/auth'
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

  const router = useRouter()
  const authStore = useAuthStore()

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

  const fromDate = ref('')
  const toDate = ref('')
  const groupBy = ref<GroupBy>('none')
  const stats = ref<StatsResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeTab = ref('chart')

  const groupByOptions = [
    { title: 'Aucun', value: 'none' },
    { title: 'Par jour', value: 'day' },
    { title: 'Par mois', value: 'month' },
    { title: 'Par annee', value: 'year' },
  ]

  const chartColors = {
    PASSENGER: { bg: '#e6007e', border: '#e6007e' },
    FREIGHT: { bg: '#F57C00', border: '#F57C00' },
    MAINTENANCE: { bg: '#0288D1', border: '#0288D1' },
    SERVICE: { bg: '#001f78', border: '#001f78' },
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
      return chartColors[colorKey] || { bg: '#9E9E9E', border: '#9E9E9E' }
    })

    return {
      labels,
      datasets: [
        {
          label: 'Distance totale (km)',
          data: stats.value.items.map((item) => item.totalDistanceKm),
          backgroundColor: colors.map((c) => c.bg),
          borderColor: colors.map((c) => c.border),
          borderWidth: 0,
          borderRadius: 0,
        },
      ],
    }
  })

  const doughnutChartData = computed(() => {
    if (!stats.value || stats.value.items.length === 0) {
      return { labels: [], datasets: [] }
    }

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
      return chartColors[colorKey] || { bg: '#9E9E9E', border: '#9E9E9E' }
    })

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.map((c) => c.bg),
          borderColor: '#fff',
          borderWidth: 3,
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Distance (km)',
          color: '#666',
        },
      },
      x: {
        grid: {
          display: false,
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
        labels: {
          padding: 20,
          usePointStyle: true,
        },
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

  const uniqueCodes = computed(() => {
    if (!stats.value) return 0
    return new Set(stats.value.items.map((i) => i.analyticCode)).size
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

  function getCodeColor(code: string): string {
    const colors: Record<string, string> = {
      PASSENGER: 'accent',
      FREIGHT: 'warning',
      MAINTENANCE: 'info',
      SERVICE: 'secondary',
    }
    return colors[code] || 'grey'
  }

  function getCodeIcon(code: string): string {
    const icons: Record<string, string> = {
      PASSENGER: 'mdi-account-group',
      FREIGHT: 'mdi-package-variant',
      MAINTENANCE: 'mdi-wrench',
      SERVICE: 'mdi-cog',
    }
    return icons[code] || 'mdi-help'
  }

  onMounted(() => {
    // Redirect to login if not authenticated
    if (!authStore.isAuthenticated) {
      router.push({ name: 'login', query: { redirect: '/stats' } })
      return
    }
    fetchStats()
  })
</script>

<template>
  <div>
    <!-- Titre de page -->
    <div class="mb-8">
      <h1 class="text-h4 font-weight-bold mb-2">Statistiques</h1>
      <p class="text-body-1 text-medium-emphasis">
        Analysez les distances parcourues par code analytique
      </p>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid mb-6">
      <v-card class="kpi-card">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <div class="kpi-icon bg-accent">
              <v-icon color="white" size="24">mdi-map-marker-distance</v-icon>
            </div>
            <div class="ml-4">
              <div class="text-caption text-medium-emphasis">Distance totale</div>
              <div class="text-h5 font-weight-bold">{{ totalDistance.toFixed(2) }} km</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="kpi-card">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <div class="kpi-icon bg-primary">
              <v-icon color="white" size="24">mdi-counter</v-icon>
            </div>
            <div class="ml-4">
              <div class="text-caption text-medium-emphasis">Enregistrements</div>
              <div class="text-h5 font-weight-bold">{{ totalRecords }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="kpi-card">
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <div class="kpi-icon bg-success">
              <v-icon color="white" size="24">mdi-tag-multiple</v-icon>
            </div>
            <div class="ml-4">
              <div class="text-caption text-medium-emphasis">Codes analytiques</div>
              <div class="text-h5 font-weight-bold">{{ uniqueCodes }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Filtres -->
    <v-card class="mb-6 card-elevated">
      <v-card-text class="pa-5">
        <div class="d-flex align-center mb-4">
          <v-icon class="mr-2" size="small">mdi-filter-variant</v-icon>
          <span class="text-subtitle-2 font-weight-medium">Filtres</span>
        </div>

        <form @submit.prevent="handleSubmit">
          <v-row align="end">
            <v-col cols="12" sm="6" md="3">
              <label class="field-label">Date de debut</label>
              <v-text-field
                v-model="fromDate"
                type="date"
                clearable
                hide-details
                density="compact"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <label class="field-label">Date de fin</label>
              <v-text-field v-model="toDate" type="date" clearable hide-details density="compact" />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <label class="field-label">Grouper par</label>
              <v-select
                v-model="groupBy"
                :items="groupByOptions"
                item-title="title"
                item-value="value"
                hide-details
                density="compact"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex gap-2">
                <v-btn type="submit" color="accent" :loading="loading" class="flex-grow-1">
                  Appliquer
                </v-btn>
                <v-btn variant="outlined" @click="resetFilters" :disabled="loading">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </form>
      </v-card-text>
    </v-card>

    <!-- Alertes -->
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

    <v-progress-linear v-if="loading" indeterminate color="accent" class="mb-6" />

    <!-- Contenu principal -->
    <template v-if="stats && !loading">
      <v-alert v-if="stats.items.length === 0" type="info" variant="tonal" class="mb-6">
        Aucune donnee pour les filtres selectionnes. Calculez quelques trajets d'abord.
      </v-alert>

      <v-card v-else class="card-elevated">
        <v-tabs v-model="activeTab" color="accent" class="tabs-border">
          <v-tab value="chart">
            <v-icon start size="small">mdi-chart-bar</v-icon>
            Barres
          </v-tab>
          <v-tab value="doughnut">
            <v-icon start size="small">mdi-chart-donut</v-icon>
            Repartition
          </v-tab>
          <v-tab value="table">
            <v-icon start size="small">mdi-table</v-icon>
            Tableau
          </v-tab>
        </v-tabs>

        <v-card-text class="pa-6">
          <v-tabs-window v-model="activeTab">
            <!-- Graphique en barres -->
            <v-tabs-window-item value="chart">
              <div style="height: 350px">
                <Bar :data="barChartData" :options="barChartOptions" />
              </div>
            </v-tabs-window-item>

            <!-- Graphique donut -->
            <v-tabs-window-item value="doughnut">
              <div class="d-flex justify-center">
                <div style="height: 350px; width: 350px">
                  <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
                </div>
              </div>
            </v-tabs-window-item>

            <!-- Tableau -->
            <v-tabs-window-item value="table">
              <v-table hover class="stats-table">
                <thead>
                  <tr>
                    <th class="text-left">Code Analytique</th>
                    <th class="text-right">Distance</th>
                    <th v-if="groupBy !== 'none'" class="text-left">Periode</th>
                    <th class="text-right">Part</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in stats.items" :key="index">
                    <td>
                      <v-chip :color="getCodeColor(item.analyticCode)" variant="flat" size="small">
                        <v-icon start size="x-small">{{ getCodeIcon(item.analyticCode) }}</v-icon>
                        {{ item.analyticCode }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <span class="font-weight-medium">{{ item.totalDistanceKm.toFixed(2) }}</span>
                      <span class="text-medium-emphasis"> km</span>
                    </td>
                    <td v-if="groupBy !== 'none'">
                      {{ item.group }}
                    </td>
                    <td class="text-right">
                      <span class="text-medium-emphasis">
                        {{ ((item.totalDistanceKm / totalDistance) * 100).toFixed(1) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td class="font-weight-bold">Total</td>
                    <td class="text-right font-weight-bold">{{ totalDistance.toFixed(2) }} km</td>
                    <td v-if="groupBy !== 'none'"></td>
                    <td class="text-right font-weight-bold">100%</td>
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
  .card-elevated {
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (max-width: 768px) {
    .kpi-grid {
      grid-template-columns: 1fr;
    }
  }

  .kpi-card {
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .kpi-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bg-accent {
    background: #e6007e;
  }

  .bg-primary {
    background: #001f78;
  }

  .bg-success {
    background: #228b22;
  }

  .field-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #666;
    margin-bottom: 4px;
  }

  .gap-2 {
    gap: 8px;
  }

  .tabs-border {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .stats-table th {
    font-weight: 500 !important;
    font-size: 12px !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666 !important;
  }

  .total-row {
    background: #f8f8f8;
  }
</style>
