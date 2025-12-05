import type { Meta, StoryObj } from '@storybook/vue3'
import LoginView from '../views/LoginView.vue'

const meta = {
  title: 'Views/LoginView',
  component: LoginView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoginView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: "Affiche un message d'erreur après une tentative de connexion échouée.",
      },
    },
  },
}

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'État de chargement pendant la tentative de connexion.',
      },
    },
  },
}

export const FilledForm: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire pré-rempli avec des données de test.',
      },
    },
  },
}
