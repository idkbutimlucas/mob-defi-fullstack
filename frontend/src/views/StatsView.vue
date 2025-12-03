<script setup lang="ts">
// Statistics view will be implemented here
</script>

<template>
  <v-card>
    <v-card-title>
      <v-icon start>mdi-chart-bar</v-icon>
      Statistiques par Code Analytique
    </v-card-title>
    <v-card-text>
      <v-alert type="info" variant="tonal" class="mb-4">
        Consultez les statistiques de distance agrégées par code analytique.
      </v-alert>

      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            label="Date de début"
            type="date"
            prepend-icon="mdi-calendar-start"
            disabled
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="Date de fin"
            type="date"
            prepend-icon="mdi-calendar-end"
            disabled
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            label="Grouper par"
            :items="['Aucun', 'Jour', 'Mois', 'Année']"
            prepend-icon="mdi-group"
            disabled
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <v-alert type="warning" variant="tonal">
        Les statistiques seront disponibles après l'implémentation de l'API.
      </v-alert>
    </v-card-text>
  </v-card>
</template>
