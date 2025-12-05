<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="5" xl="4">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-4">
            <v-icon icon="mdi-login" class="mr-2" />
            Connexion
          </v-card-title>

          <v-alert v-if="authStore.error" type="error" class="mb-4" closable @click:close="authStore.clearError()">
            {{ authStore.error }}
          </v-alert>

          <v-form @submit.prevent="handleLogin" ref="form">
            <v-text-field
              v-model="username"
              label="Nom d'utilisateur"
              prepend-inner-icon="mdi-account"
              :rules="[rules.required]"
              :disabled="authStore.isLoading"
            />

            <v-text-field
              v-model="password"
              label="Mot de passe"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :rules="[rules.required]"
              :disabled="authStore.isLoading"
            />

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              class="mt-4"
              :loading="authStore.isLoading"
            >
              Se connecter
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <div class="text-center">
            <span class="text-body-2">Pas encore de compte ?</span>
            <router-link to="/signup" class="text-primary ml-1">
              Creer un compte
            </router-link>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

const rules = {
  required: (v: string) => !!v || 'Ce champ est requis',
}

async function handleLogin() {
  try {
    await authStore.login(username.value, password.value)
    router.push('/')
  } catch {
    // Error is handled by the store
  }
}
</script>
