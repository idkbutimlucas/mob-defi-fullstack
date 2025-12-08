import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse, delay } from 'msw'
import { within, userEvent } from '@storybook/test'
import SignupView from '../views/SignupView.vue'
import { mockUser } from '../mocks/handlers'

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
 * Formulaire avec erreurs de validation.
 */
export const WithValidationErrors: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Affiche les erreurs de validation des champs (email invalide, username trop court).',
      },
    },
    msw: {
      handlers: [
        http.post('*/api/v1/register', async () => {
          await delay(300)
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                username: "Le nom d'utilisateur doit contenir au moins 3 caracteres",
                email: "Format d'email invalide",
              },
            },
            { status: 400 }
          )
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const emailInput = canvas.getByLabelText(/email/i)
    const passwordInput = canvas.getByLabelText(/^mot de passe$/i)
    const confirmInput = canvas.getByLabelText(/confirmer/i)

    await userEvent.type(usernameInput, 'ab')
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.type(passwordInput, 'pass123')
    await userEvent.type(confirmInput, 'pass123')

    const submitButton = canvas.getByRole('button', { name: /inscription/i })
    await userEvent.click(submitButton)
  },
}

/**
 * Erreur serveur (utilisateur deja existant).
 */
export const WithServerError: Story = {
  parameters: {
    docs: {
      description: {
        story: "Affiche une erreur serveur quand l'utilisateur existe deja.",
      },
    },
    msw: {
      handlers: [
        http.post('*/api/v1/register', async () => {
          await delay(300)
          return HttpResponse.json(
            { message: "Ce nom d'utilisateur est deja pris" },
            { status: 409 }
          )
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const usernameInput = canvas.getByLabelText(/nom d'utilisateur/i)
    const emailInput = canvas.getByLabelText(/email/i)
    const passwordInput = canvas.getByLabelText(/^mot de passe$/i)
    const confirmInput = canvas.getByLabelText(/confirmer/i)

    await userEvent.type(usernameInput, 'existing_user')
    await userEvent.type(emailInput, 'existing@mob.ch')
    await userEvent.type(passwordInput, 'Password123!')
    await userEvent.type(confirmInput, 'Password123!')

    const submitButton = canvas.getByRole('button', { name: /inscription/i })
    await userEvent.click(submitButton)
  },
}

/**
 * Etat de chargement pendant l'inscription.
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Etat de chargement pendant la creation du compte.',
      },
    },
    msw: {
      handlers: [
        http.post('*/api/v1/register', async () => {
          await delay('infinite')
          return HttpResponse.json({ message: 'User created', user: mockUser }, { status: 201 })
        }),
      ],
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
    await userEvent.type(confirmInput, 'Password123!')

    const submitButton = canvas.getByRole('button', { name: /inscription/i })
    await userEvent.click(submitButton)
  },
}

/**
 * Les mots de passe ne correspondent pas.
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
