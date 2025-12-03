<script setup lang="ts">
// Route calculator will be implemented here
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

      <v-form>
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              label="Station de départ"
              prepend-icon="mdi-map-marker"
              placeholder="Rechercher une station..."
              disabled
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              label="Station d'arrivée"
              prepend-icon="mdi-map-marker-check"
              placeholder="Rechercher une station..."
              disabled
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field
              label="Code analytique"
              prepend-icon="mdi-tag"
              placeholder="Ex: PASSENGER, FREIGHT, MAINTENANCE"
              disabled
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="text-center">
            <v-btn color="primary" size="large" disabled>
              <v-icon start>mdi-calculator</v-icon>
              Calculer le trajet
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>
