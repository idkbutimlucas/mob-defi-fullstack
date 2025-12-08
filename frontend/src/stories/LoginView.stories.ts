import type { Meta, StoryObj } from '@storybook/vue3'
import { within, userEvent } from '@storybook/test'
import LoginView from '../views/LoginView.vue'

/**
 * Page de connexion permettant aux utilisateurs de s'authentifier
 * avec leur nom d'utilisateur et mot de passe.
 *
 * ## Fonctionnalites
 * - Formulaire de connexion avec validation
 * - Affichage des erreurs d'authentification
 * - Redirection vers la page d'inscription
 * - Toggle de visibilite du mot de passe
 */
const meta = {
  title: 'Views/LoginView',
  component: LoginView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: "Page de connexion pour l'authentification des utilisateurs du systeme MOB.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoginView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Etat par defaut avec formulaire vide.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire de connexion vide pret a recevoir les identifiants.',
      },
    },
  },
}

/**
 * Formulaire pre-rempli avec des identifiants.
 */
export const FilledForm: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire avec des identifiants deja saisis.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find inputs by their labels
    const inputs = canvasElement.querySelectorAll('input')
    const usernameInput = inputs[0] as HTMLInputElement
    const passwordInput = inputs[1] as HTMLInputElement

    if (usernameInput && passwordInput) {
      await userEvent.type(usernameInput, 'demo_user')
      await userEvent.type(passwordInput, 'SecurePass123!')
    }
  },
}

/**
 * Affichage du mot de passe (toggle visibilite).
 */
export const ShowPassword: Story = {
  parameters: {
    docs: {
      description: {
        story: "Saisie du mot de passe puis clic sur l'icone pour afficher le mot de passe.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const inputs = canvasElement.querySelectorAll('input')
    const passwordInput = inputs[1] as HTMLInputElement

    if (passwordInput) {
      await userEvent.type(passwordInput, 'MonMotDePasse!')
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Click on the eye icon to show password
      const eyeIcon = canvasElement.querySelector('.mdi-eye')
      if (eyeIcon) {
        await userEvent.click(eyeIcon)
      }
    }
  },
}

/**
 * Tentative de soumission avec champs vides.
 */
export const EmptySubmit: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Clic sur le bouton sans remplir les champs - affiche les erreurs de validation.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Click the submit button
    const submitButton = canvas.getByRole('button', { name: /se connecter/i })
    await userEvent.click(submitButton)
  },
}

/**
 * Connexion complete avec soumission du formulaire.
 */
export const LoginAttempt: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Remplissage du formulaire et soumission - simule une tentative de connexion.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const inputs = canvasElement.querySelectorAll('input')
    const usernameInput = inputs[0] as HTMLInputElement
    const passwordInput = inputs[1] as HTMLInputElement

    if (usernameInput && passwordInput) {
      await userEvent.type(usernameInput, 'jean.dupont')
      await userEvent.type(passwordInput, 'Password2024!')
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Submit the form
      const submitButton = canvas.getByRole('button', { name: /se connecter/i })
      await userEvent.click(submitButton)
    }
  },
}

/**
 * Echec de connexion - identifiants incorrects.
 */
export const LoginFailed: Story = {
  parameters: {
    docs: {
      description: {
        story: "Affichage du message d'erreur apres une tentative de connexion echouee.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Set error scenario
    window.__STORYBOOK_SCENARIO__ = 'login-error'
    await new Promise((resolve) => setTimeout(resolve, 500))

    const inputs = canvasElement.querySelectorAll('input')
    const usernameInput = inputs[0] as HTMLInputElement
    const passwordInput = inputs[1] as HTMLInputElement

    if (usernameInput && passwordInput) {
      await userEvent.type(usernameInput, 'wrong_user')
      await userEvent.type(passwordInput, 'WrongPassword!')
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Submit the form - will trigger error
      const submitButton = canvas.getByRole('button', { name: /se connecter/i })
      await userEvent.click(submitButton)

      // Reset scenario after a delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      window.__STORYBOOK_SCENARIO__ = 'default'
    }
  },
}
