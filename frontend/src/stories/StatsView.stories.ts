import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse, delay } from 'msw'
import { userEvent } from '@storybook/test'
import StatsView from '../views/StatsView.vue'
import { mockStatsData } from '../mocks/handlers'

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
 * Affichage par defaut avec les donnees mockees.
 * Montre les KPIs, les filtres et les graphiques.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Vue par defaut avec des donnees de statistiques.',
      },
    },
  },
}

/**
 * Vue avec le graphique a barres selectionne.
 * Ideal pour comparer les distances entre codes analytiques.
 */
export const BarChart: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Graphique a barres comparant les distances par code analytique.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Click on bar chart tab
    const tabs = canvasElement.querySelectorAll('.v-tab')
    if (tabs.length > 0) {
      await userEvent.click(tabs[0] as HTMLElement)
    }
  },
}

/**
 * Vue avec le graphique en camembert (repartition).
 * Montre la proportion de chaque code analytique.
 */
export const DoughnutChart: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Graphique circulaire montrant la repartition des distances.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Click on doughnut chart tab
    const tabs = canvasElement.querySelectorAll('.v-tab')
    if (tabs.length > 1) {
      await userEvent.click(tabs[1] as HTMLElement)
    }
  },
}

/**
 * Vue tableau avec toutes les donnees detaillees.
 * Affiche le code, la distance et le pourcentage.
 */
export const TableView: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Tableau detaille avec distances et pourcentages.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Click on table tab
    const tabs = canvasElement.querySelectorAll('.v-tab')
    if (tabs.length > 2) {
      await userEvent.click(tabs[2] as HTMLElement)
    }
  },
}

/**
 * Etat de chargement pendant la recuperation des donnees.
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Barre de progression pendant le chargement.',
      },
    },
    msw: {
      handlers: [
        http.get('*/api/v1/stats/distances', async () => {
          await delay('infinite')
          return HttpResponse.json(mockStatsData)
        }),
      ],
    },
  },
}

/**
 * Etat vide quand aucune donnee n'est disponible.
 * Invite l'utilisateur a calculer des trajets.
 */
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: "Message affiche quand aucune statistique n'est disponible.",
      },
    },
    msw: {
      handlers: [
        http.get('*/api/v1/stats/distances', async () => {
          await delay(200)
          return HttpResponse.json({
            from: null,
            to: null,
            groupBy: 'none',
            items: [],
          })
        }),
      ],
    },
  },
}

/**
 * Statistiques filtrees par periode.
 */
export const WithDateFilter: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Donnees filtrees par periode specifique.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Try to find and interact with date inputs
    const fromInput = canvasElement.querySelector('[data-testid="from-date"]') as HTMLInputElement
    const toInput = canvasElement.querySelector('[data-testid="to-date"]') as HTMLInputElement

    if (fromInput) {
      await userEvent.clear(fromInput)
      await userEvent.type(fromInput, '2024-01-01')
    }

    if (toInput) {
      await userEvent.clear(toInput)
      await userEvent.type(toInput, '2024-03-31')
    }
  },
}

/**
 * Statistiques groupees par mois.
 */
export const GroupedByMonth: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Donnees groupees par mois pour analyse temporelle.',
      },
    },
    msw: {
      handlers: [
        http.get('*/api/v1/stats/distances', async () => {
          await delay(200)
          return HttpResponse.json({
            from: '2024-01-01',
            to: '2024-12-31',
            groupBy: 'month',
            items: [
              { analyticCode: 'PASSENGER', totalDistanceKm: 15420.5, group: '2024-01' },
              { analyticCode: 'PASSENGER', totalDistanceKm: 14280.3, group: '2024-02' },
              { analyticCode: 'PASSENGER', totalDistanceKm: 16890.7, group: '2024-03' },
              { analyticCode: 'FREIGHT', totalDistanceKm: 8450.2, group: '2024-01' },
              { analyticCode: 'FREIGHT', totalDistanceKm: 7920.8, group: '2024-02' },
              { analyticCode: 'FREIGHT', totalDistanceKm: 9120.4, group: '2024-03' },
            ],
          })
        }),
      ],
    },
  },
}
