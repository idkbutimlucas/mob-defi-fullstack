import type { Meta, StoryObj } from '@storybook/vue3'
import SignupView from '../views/SignupView.vue'

const meta = {
  title: 'Views/SignupView',
  component: SignupView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SignupView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire d\'inscription par défaut.',
      },
    },
  },
}

export const WithValidationErrors: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Affiche les erreurs de validation des champs.',
      },
    },
  },
}

export const WithServerError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Affiche une erreur serveur (ex: email déjà utilisé).',
      },
    },
  },
}

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'État de chargement pendant l\'inscription.',
      },
    },
  },
}

export const PasswordMismatch: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Les mots de passe ne correspondent pas.',
      },
    },
  },
}
