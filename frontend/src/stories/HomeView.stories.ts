import type { Meta, StoryObj } from '@storybook/vue3'
import HomeView from '../views/HomeView.vue'

/**
 * Page principale de l'application permettant de calculer un trajet
 * entre deux stations du réseau MOB.
 *
 * ## Fonctionnalités
 * - Sélection de la station de départ et d'arrivée
 * - Choix du code analytique (Passagers, Fret, Maintenance, Service)
 * - Code analytique personnalisé
 * - Affichage du résultat avec distance et stations traversées
 */
const meta = {
  title: 'Views/HomeView',
  component: HomeView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Calculateur de trajet entre deux stations du réseau ferroviaire MOB (Montreux-Oberland-Bernois).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * État par défaut de la page avec le formulaire vide.
 * Les stations sont chargées automatiquement depuis l'API.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire vide prêt à recevoir les sélections utilisateur.',
      },
    },
  },
}

/**
 * Simulation d'un calcul de trajet réussi.
 * Montre le résultat avec la distance et le chemin calculé.
 */
export const WithRouteResult: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Affichage du résultat après un calcul de trajet réussi entre Montreux et Zweisimmen.',
      },
    },
  },
}

/**
 * État de chargement pendant le calcul du trajet.
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'État de chargement pendant que le calcul est en cours.',
      },
    },
  },
}

/**
 * Affichage d'une erreur (station non trouvée, réseau indisponible, etc.)
 */
export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Affichage d\'un message d\'erreur en cas de problème.',
      },
    },
  },
}
