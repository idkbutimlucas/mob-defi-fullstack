<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="5" xl="4">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-4">
            <v-icon icon="mdi-account-plus" class="mr-2" />
            Inscription
          </v-card-title>

          <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
            {{ error }}
          </v-alert>

          <v-alert v-if="fieldErrors" type="error" class="mb-4">
            <ul class="pl-4">
              <li v-for="(msg, field) in fieldErrors" :key="field">
                <strong>{{ field }}:</strong> {{ msg }}
              </li>
            </ul>
          </v-alert>

          <v-form @submit.prevent="handleSignup" ref="form">
            <v-text-field
              v-model="username"
              label="Nom d'utilisateur"
              prepend-inner-icon="mdi-account"
              :rules="[rules.required, rules.minLength(3)]"
              :disabled="authStore.isLoading"
              hint="3 caracteres minimum, lettres, chiffres et underscores"
            />

            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :rules="[rules.required, rules.email]"
              :disabled="authStore.isLoading"
            />

            <v-text-field
              v-model="password"
              label="Mot de passe"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :rules="[rules.required, rules.minLength(6)]"
              :disabled="authStore.isLoading"
              hint="6 caracteres minimum"
            />

            <v-text-field
              v-model="confirmPassword"
              label="Confirmer le mot de passe"
              prepend-inner-icon="mdi-lock-check"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.required, rules.passwordMatch]"
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
              Creer mon compte
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <div class="text-center">
            <span class="text-body-2">Deja un compte ?</span>
            <router-link to="/login" class="text-primary ml-1"> Se connecter </router-link>
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
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const error = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string> | null>(null)

  const rules = {
    required: (v: string) => !!v || 'Ce champ est requis',
    minLength: (min: number) => (v: string) => v.length >= min || `Minimum ${min} caracteres`,
    email: (v: string) => /.+@.+\..+/.test(v) || 'Email invalide',
    passwordMatch: (v: string) => v === password.value || 'Les mots de passe ne correspondent pas',
  }

  async function handleSignup() {
    error.value = null
    fieldErrors.value = null

    try {
      await authStore.register({
        username: username.value,
        email: email.value,
        password: password.value,
      })
      router.push('/')
    } catch (e) {
      if (e instanceof Error) {
        // Try to parse field errors from the message
        try {
          const parsed = JSON.parse(e.message)
          if (parsed.errors) {
            fieldErrors.value = parsed.errors
            return
          }
        } catch {
          // Not JSON, use as regular error
        }
        error.value = e.message
      }
    }
  }
</script>
