import type { Meta, StoryObj } from '@storybook/vue3'
import StatsView from '../views/StatsView.vue'

/**
 * Page de statistiques affichant les distances parcourues par code analytique.
 *
 * ## Fonctionnalités
 * - KPIs : distance totale, nombre d'enregistrements, codes uniques
 * - Filtrage par période (date de début/fin)
 * - Groupement par jour, mois ou année
 * - Visualisation en graphique à barres, camembert ou tableau
 *
 * ## Codes analytiques
 * - **PASSENGER** : Trajets passagers
 * - **FREIGHT** : Transport de marchandises
 * - **MAINTENANCE** : Trajets de maintenance
 * - **SERVICE** : Trajets de service
 */
const meta = {
  title: 'Views/StatsView',
  component: StatsView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tableau de bord des statistiques de distances parcourues, agrégées par code analytique.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatsView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Affichage par défaut avec les données mockées.
 * Montre les KPIs, les filtres et les graphiques.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Vue par défaut avec des données de statistiques.',
      },
    },
  },
}

/**
 * Vue avec le graphique à barres sélectionné.
 * Idéal pour comparer les distances entre codes analytiques.
 */
export const BarChart: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Graphique à barres comparant les distances par code analytique.',
      },
    },
  },
}

/**
 * Vue avec le graphique en camembert (répartition).
 * Montre la proportion de chaque code analytique.
 */
export const DoughnutChart: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Graphique circulaire montrant la répartition des distances.',
      },
    },
  },
}

/**
 * Vue tableau avec toutes les données détaillées.
 * Affiche le code, la distance et le pourcentage.
 */
export const TableView: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Tableau détaillé avec distances et pourcentages.',
      },
    },
  },
}

/**
 * État de chargement pendant la récupération des données.
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Barre de progression pendant le chargement.',
      },
    },
  },
}

/**
 * État vide quand aucune donnée n'est disponible.
 * Invite l'utilisateur à calculer des trajets.
 */
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: "Message affiché quand aucune statistique n'est disponible.",
      },
    },
  },
}
