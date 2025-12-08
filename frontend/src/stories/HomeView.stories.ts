import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse, delay } from 'msw'
import HomeView from '../views/HomeView.vue'
import { mockStations, mockRouteResult } from '../mocks/handlers'

/**
 * Page principale de l'application permettant de calculer un trajet
 * entre deux stations du reseau MOB.
 *
 * ## Fonctionnalites
 * - Selection de la station de depart et d'arrivee
 * - Choix du code analytique (Passagers, Fret, Maintenance, Service)
 * - Code analytique personnalise
 * - Affichage du resultat avec distance et stations traversees
 */
const meta = {
  title: 'Views/HomeView',
  component: HomeView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Calculateur de trajet entre deux stations du reseau ferroviaire MOB (Montreux-Oberland-Bernois).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Etat par defaut de la page avec le formulaire vide.
 * Les stations sont chargees automatiquement depuis l'API.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire vide pret a recevoir les selections utilisateur.',
      },
    },
  },
}

/**
 * Simulation d'un calcul de trajet reussi.
 * Montre le resultat avec la distance et le chemin calcule.
 */
export const WithRouteResult: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Affichage du resultat apres un calcul de trajet reussi entre Montreux et Zweisimmen.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for component to mount and load stations
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find and fill the form
    const fromSelect = canvasElement.querySelector('[data-testid="from-station"]') as HTMLElement
    const toSelect = canvasElement.querySelector('[data-testid="to-station"]') as HTMLElement

    if (fromSelect) fromSelect.click()
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Select first station
    const firstOption = document.querySelector('.v-list-item')
    if (firstOption) (firstOption as HTMLElement).click()

    await new Promise((resolve) => setTimeout(resolve, 200))

    if (toSelect) toSelect.click()
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Select last station
    const options = document.querySelectorAll('.v-list-item')
    if (options.length > 1) (options[options.length - 1] as HTMLElement).click()

    await new Promise((resolve) => setTimeout(resolve, 200))

    // Submit form
    const submitBtn = canvasElement.querySelector('button[type="submit"]') as HTMLElement
    if (submitBtn) submitBtn.click()
  },
}

/**
 * Etat de chargement pendant le calcul du trajet.
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Etat de chargement pendant que le calcul est en cours.',
      },
    },
    msw: {
      handlers: [
        http.get('*/api/v1/stations', async () => {
          return HttpResponse.json(mockStations)
        }),
        http.post('*/api/v1/routes', async () => {
          await delay('infinite')
          return HttpResponse.json(mockRouteResult, { status: 201 })
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const fromSelect = canvasElement.querySelector('[data-testid="from-station"]') as HTMLElement
    const toSelect = canvasElement.querySelector('[data-testid="to-station"]') as HTMLElement

    if (fromSelect) fromSelect.click()
    await new Promise((resolve) => setTimeout(resolve, 200))
    const firstOption = document.querySelector('.v-list-item')
    if (firstOption) (firstOption as HTMLElement).click()
    await new Promise((resolve) => setTimeout(resolve, 200))

    if (toSelect) toSelect.click()
    await new Promise((resolve) => setTimeout(resolve, 200))
    const options = document.querySelectorAll('.v-list-item')
    if (options.length > 1) (options[options.length - 1] as HTMLElement).click()
    await new Promise((resolve) => setTimeout(resolve, 200))

    const submitBtn = canvasElement.querySelector('button[type="submit"]') as HTMLElement
    if (submitBtn) submitBtn.click()
  },
}

/**
 * Affichage d'une erreur (station non trouvee, reseau indisponible, etc.)
 */
export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: "Affichage d'un message d'erreur en cas de probleme.",
      },
    },
    msw: {
      handlers: [
        http.get('*/api/v1/stations', async () => {
          return HttpResponse.json(mockStations)
        }),
        http.post('*/api/v1/routes', async () => {
          await delay(300)
          return HttpResponse.json(
            { message: 'Aucun itineraire trouve entre ces deux stations' },
            { status: 422 }
          )
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const fromSelect = canvasElement.querySelector('[data-testid="from-station"]') as HTMLElement
    const toSelect = canvasElement.querySelector('[data-testid="to-station"]') as HTMLElement

    if (fromSelect) fromSelect.click()
    await new Promise((resolve) => setTimeout(resolve, 200))
    const firstOption = document.querySelector('.v-list-item')
    if (firstOption) (firstOption as HTMLElement).click()
    await new Promise((resolve) => setTimeout(resolve, 200))

    if (toSelect) toSelect.click()
    await new Promise((resolve) => setTimeout(resolve, 200))
    const options = document.querySelectorAll('.v-list-item')
    if (options.length > 1) (options[options.length - 1] as HTMLElement).click()
    await new Promise((resolve) => setTimeout(resolve, 200))

    const submitBtn = canvasElement.querySelector('button[type="submit"]') as HTMLElement
    if (submitBtn) submitBtn.click()
  },
}
