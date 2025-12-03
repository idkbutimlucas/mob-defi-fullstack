<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getStats, type StatsResponse, type GroupBy } from '@/api/client'

  const fromDate = ref('')
  const toDate = ref('')
  const groupBy = ref<GroupBy>('none')
  const stats = ref<StatsResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const groupByOptions = [
    { title: 'Aucun', value: 'none' },
    { title: 'Jour', value: 'day' },
    { title: 'Mois', value: 'month' },
    { title: 'Annee', value: 'year' },
  ]

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

  onMounted(() => {
    fetchStats()
  })
</script>

<template>
  <v-card>
    <v-card-title>
      <v-icon start>mdi-chart-bar</v-icon>
      Statistiques par Code Analytique
    </v-card-title>
    <v-card-text>
      <v-alert type="info" variant="tonal" class="mb-4">
        Consultez les statistiques de distance agregees par code analytique.
      </v-alert>

      <form @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="fromDate"
              label="Date de debut"
              type="date"
              prepend-icon="mdi-calendar-start"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="toDate"
              label="Date de fin"
              type="date"
              prepend-icon="mdi-calendar-end"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="groupBy"
              label="Grouper par"
              :items="groupByOptions"
              item-title="title"
              item-value="value"
              prepend-icon="mdi-group"
            />
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn type="submit" color="primary" :loading="loading" block>
              <v-icon start>mdi-magnify</v-icon>
              Filtrer
            </v-btn>
          </v-col>
        </v-row>
      </form>

      <v-divider class="my-4" />

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <template v-if="stats && !loading">
        <v-alert v-if="stats.items.length === 0" type="info" variant="tonal">
          Aucune donnee pour les filtres selectionnes.
        </v-alert>

        <v-table v-else>
          <thead>
            <tr>
              <th>Code Analytique</th>
              <th class="text-right">Distance Totale (km)</th>
              <th v-if="groupBy !== 'none'">Periode</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in stats.items" :key="index">
              <td>
                <v-chip color="primary" variant="tonal" size="small">
                  {{ item.analyticCode }}
                </v-chip>
              </td>
              <td class="text-right font-weight-bold">
                {{ item.totalDistanceKm.toFixed(2) }} km
              </td>
              <td v-if="groupBy !== 'none'">
                {{ item.group }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card-text>
  </v-card>
</template>
