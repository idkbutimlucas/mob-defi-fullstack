import type { Meta, StoryObj } from '@storybook/vue3'
import { userEvent } from '@storybook/test'
import StatsView from '../views/StatsView.vue'

/**
 * Page de statistiques affichant les distances parcourues par code analytique.
 *
 * ## Fonctionnalites
 * - KPIs : distance totale, nombre d'enregistrements, codes uniques
 * - Filtrage par periode (date de debut/fin)
 * - Groupement par jour, mois ou annee
 * - Visualisation en graphique a barres, camembert ou tableau
 *
 * ## Codes analytiques
 * - **PASSENGER** : Trajets passagers
 * - **FREIGHT** : Transport de marchandises
 * - **MAINTENANCE** : Trajets de maintenance
 * - **SERVICE** : Trajets de service
 *
 * **Note**: Les donnees sont mockees dans Storybook. Les filtres sont
 * visibles mais ne modifient pas les donnees affichees.
 */
const meta = {
  title: 'Views/StatsView',
  component: StatsView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tableau de bord des statistiques de distances parcourues, agregees par code analytique.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatsView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Vue par defaut - Graphique a barres.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Vue par defaut avec KPIs, filtres et graphique a barres.',
      },
    },
  },
}

/**
 * Graphique circulaire (Repartition).
 */
export const DoughnutChart: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Visualisation en graphique circulaire montrant la repartition par code analytique.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const tabs = canvasElement.querySelectorAll('.v-tab')
    if (tabs.length > 1) {
      await userEvent.click(tabs[1] as HTMLElement)
    }
  },
}

/**
 * Vue tableau detaillee.
 */
export const TableView: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Tableau detaille avec distance par code analytique et pourcentage.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const tabs = canvasElement.querySelectorAll('.v-tab')
    if (tabs.length > 2) {
      await userEvent.click(tabs[2] as HTMLElement)
    }
  },
}

/**
 * Aucune donnee disponible.
 */
export const NoData: Story = {
  parameters: {
    docs: {
      description: {
        story: "Message affiche quand aucune statistique n'est disponible.",
      },
    },
  },
  decorators: [
    (story) => {
      window.__STORYBOOK_SCENARIO__ = 'stats-empty'
      return story()
    },
  ],
  play: async () => {
    // Reset scenario after render
    await new Promise((resolve) => setTimeout(resolve, 1000))
    window.__STORYBOOK_SCENARIO__ = 'default'
  },
}

/**
 * Erreur de chargement.
 */
export const LoadError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Erreur affichee en cas de probleme de chargement des statistiques.',
      },
    },
  },
  decorators: [
    (story) => {
      window.__STORYBOOK_SCENARIO__ = 'stats-error'
      return story()
    },
  ],
  play: async () => {
    // Reset scenario after render
    await new Promise((resolve) => setTimeout(resolve, 1000))
    window.__STORYBOOK_SCENARIO__ = 'default'
  },
}
