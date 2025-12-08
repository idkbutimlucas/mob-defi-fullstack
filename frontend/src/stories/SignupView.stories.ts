import type { Meta, StoryObj } from '@storybook/vue3'
import { within, userEvent } from '@storybook/test'
import SignupView from '../views/SignupView.vue'

/**
 * Page d'inscription permettant aux nouveaux utilisateurs
 * de creer un compte sur le systeme MOB.
 *
 * ## Fonctionnalites
 * - Formulaire d'inscription avec validation
 * - Verification de la correspondance des mots de passe
 * - Validation email et longueur username
 * - Gestion des erreurs serveur (conflit, validation)
 */
const meta = {
  title: 'Views/SignupView',
  component: SignupView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: "Page d'inscription pour les nouveaux utilisateurs du systeme MOB.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SignupView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Etat par defaut avec formulaire vide.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Formulaire d'inscription vide pret a etre rempli.",
      },
    },
  },
}

/**
 * Formulaire rempli correctement.
 */
export const FilledForm: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire avec toutes les informations correctement remplies.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const emailInput = canvas.getByLabelText(/email/i)
    const passwordInput = canvas.getByLabelText(/^mot de passe$/i)
    const confirmInput = canvas.getByLabelText(/confirmer/i)

    await userEvent.type(usernameInput, 'nouveau_user')
    await userEvent.type(emailInput, 'nouveau@mob.ch')
    await userEvent.type(passwordInput, 'SecurePass123!')
    await userEvent.type(confirmInput, 'SecurePass123!')
  },
}

/**
 * Erreur: mots de passe differents.
 */
export const PasswordMismatch: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Erreur de validation quand les mots de passe ne correspondent pas.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const emailInput = canvas.getByLabelText(/email/i)
    const passwordInput = canvas.getByLabelText(/^mot de passe$/i)
    const confirmInput = canvas.getByLabelText(/confirmer/i)

    await userEvent.type(usernameInput, 'new_user')
    await userEvent.type(emailInput, 'new@mob.ch')
    await userEvent.type(passwordInput, 'Password123!')
    await userEvent.type(confirmInput, 'DifferentPassword!')
  },
}

/**
 * Username trop court.
 */
export const ShortUsername: Story = {
  parameters: {
    docs: {
      description: {
        story: "Nom d'utilisateur trop court (moins de 3 caracteres).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const emailInput = canvas.getByLabelText(/email/i)

    await userEvent.type(usernameInput, 'ab')
    await userEvent.type(emailInput, 'test@mob.ch')
  },
}

/**
 * Erreur serveur: email deja utilise.
 */
export const EmailAlreadyExists: Story = {
  parameters: {
    docs: {
      description: {
        story: "Erreur du serveur indiquant que l'email est deja utilise.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Set error scenario
    window.__STORYBOOK_SCENARIO__ = 'register-email-exists'
    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const emailInput = canvas.getByLabelText(/email/i)
    const passwordInput = canvas.getByLabelText(/^mot de passe$/i)
    const confirmInput = canvas.getByLabelText(/confirmer/i)

    await userEvent.type(usernameInput, 'existing_user')
    await userEvent.type(emailInput, 'existing@mob.ch')
    await userEvent.type(passwordInput, 'Password123!')
    await userEvent.type(confirmInput, 'Password123!')
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Submit the form - will trigger error
    const submitButton = canvas.getByRole('button', { name: /cr[eé]er/i })
    await userEvent.click(submitButton)

    // Reset scenario
    await new Promise((resolve) => setTimeout(resolve, 500))
    window.__STORYBOOK_SCENARIO__ = 'default'
  },
}
