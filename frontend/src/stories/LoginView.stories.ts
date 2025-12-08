import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse, delay } from 'msw'
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
 * Formulaire avec erreur d'authentification.
 */
export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: "Affichage du message d'erreur apres une tentative de connexion echouee.",
      },
    },
    msw: {
      handlers: [
        http.post('*/api/v1/login', async () => {
          await delay(300)
          return HttpResponse.json({ message: 'Identifiants invalides' }, { status: 401 })
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const passwordInput = canvas.getByLabelText(/mot de passe/i)

    await userEvent.type(usernameInput, 'wrong_user')
    await userEvent.type(passwordInput, 'wrong_password')

    const submitButton = canvas.getByRole('button', { name: /connexion/i })
    await userEvent.click(submitButton)
  },
}

/**
 * Etat de chargement pendant l'authentification.
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Etat de chargement pendant la verification des identifiants.',
      },
    },
    msw: {
      handlers: [
        http.post('*/api/v1/login', async () => {
          await delay('infinite')
          return HttpResponse.json({ token: 'mock-token' })
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const passwordInput = canvas.getByLabelText(/mot de passe/i)

    await userEvent.type(usernameInput, 'demo_user')
    await userEvent.type(passwordInput, 'password123')

    const submitButton = canvas.getByRole('button', { name: /connexion/i })
    await userEvent.click(submitButton)
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
    const canvas = within(canvasElement)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const passwordInput = canvas.getByLabelText(/mot de passe/i)

    await userEvent.type(usernameInput, 'demo_user')
    await userEvent.type(passwordInput, 'SecurePass123!')
  },
}
