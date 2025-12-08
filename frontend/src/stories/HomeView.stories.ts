import type { Meta, StoryObj } from '@storybook/vue3'
import { within, userEvent } from '@storybook/test'
import HomeView from '../views/HomeView.vue'

/**
 * Page principale de l'application permettant de calculer un trajet
 * entre deux stations du reseau MOB.
 *
 * ## Fonctionnalites
 * - Selection de la station de depart et d'arrivee
 * - Choix du code analytique (Passagers, Fret, Maintenance, Service)
 * - Code analytique personnalise
 * - Affichage du resultat avec distance et stations traversees
 *
 * **Note**: Les donnees sont mockees dans Storybook pour permettre
 * le test des interactions sans backend.
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
 * Etat par defaut avec le formulaire vide.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Formulaire de calcul de trajet avec stations chargees depuis le mock.',
      },
    },
  },
}

/**
 * Selection des stations uniquement (sans soumission).
 */
export const StationsSelected: Story = {
  parameters: {
    docs: {
      description: {
        story: "Selection des stations de depart et d'arrivee via les menus deroulants.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const fromInput = canvasElement.querySelector(
      '[data-testid="from-station"] input'
    ) as HTMLInputElement
    const toInput = canvasElement.querySelector(
      '[data-testid="to-station"] input'
    ) as HTMLInputElement

    if (fromInput && toInput) {
      // Select "from" station - Vevey
      await userEvent.click(fromInput)
      await new Promise((resolve) => setTimeout(resolve, 300))
      await userEvent.type(fromInput, 'Vev')
      await new Promise((resolve) => setTimeout(resolve, 300))
      const fromOptions = document.querySelectorAll('.v-list-item')
      if (fromOptions.length > 0) {
        await userEvent.click(fromOptions[0] as HTMLElement)
      }
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Select "to" station - Zweisimmen
      await userEvent.click(toInput)
      await new Promise((resolve) => setTimeout(resolve, 300))
      await userEvent.type(toInput, 'Zwei')
      await new Promise((resolve) => setTimeout(resolve, 300))
      const toOptions = document.querySelectorAll('.v-list-item')
      if (toOptions.length > 0) {
        await userEvent.click(toOptions[0] as HTMLElement)
      }
    }
  },
}

/**
 * Selection du type Fret.
 */
export const FreightType: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Selection du type de trajet Fret.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Click on Fret chip
    const fretChip = canvas.getByText('Fret')
    await userEvent.click(fretChip)
  },
}

/**
 * Selection du type Maintenance.
 */
export const MaintenanceType: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Selection du type de trajet Maintenance.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Click on Maintenance chip
    const maintenanceChip = canvas.getByText('Maintenance')
    await userEvent.click(maintenanceChip)
  },
}

/**
 * Activation du code personnalise.
 */
export const CustomCode: Story = {
  parameters: {
    docs: {
      description: {
        story: "Activation et saisie d'un code analytique personnalise.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Click on custom code checkbox
    const checkbox = canvas.getByLabelText(/code personnalis/i)
    await userEvent.click(checkbox)

    // Wait for the input field to appear
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Find and type in the custom code input (has placeholder "Ex: SPECIAL")
    const customInput = canvas.getByPlaceholderText(/ex.*special/i)
    await userEvent.type(customInput, 'TRAIN_EXPRESS')
  },
}

/**
 * Calcul d'itineraire complet avec selection des stations.
 */
export const RouteCalculation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Calcul d'itineraire complet : selection des stations, type de trajet, et soumission.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Get autocomplete inputs by data-testid
    const fromInput = canvasElement.querySelector(
      '[data-testid="from-station"] input'
    ) as HTMLInputElement
    const toInput = canvasElement.querySelector(
      '[data-testid="to-station"] input'
    ) as HTMLInputElement

    if (fromInput && toInput) {
      // Click and select "from" station
      await userEvent.click(fromInput)
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Type to filter and select Montreux
      await userEvent.type(fromInput, 'Mon')
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Click on the first option in dropdown
      const fromOptions = document.querySelectorAll('.v-list-item')
      if (fromOptions.length > 0) {
        await userEvent.click(fromOptions[0] as HTMLElement)
      }
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Click and select "to" station
      await userEvent.click(toInput)
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Type to filter and select Gstaad
      await userEvent.type(toInput, 'Gst')
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Click on the first option in dropdown
      const toOptions = document.querySelectorAll('.v-list-item')
      if (toOptions.length > 0) {
        await userEvent.click(toOptions[0] as HTMLElement)
      }
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Select trip type - click on "Passagers" chip
      const passagersChip = canvas.getByText('Passagers')
      await userEvent.click(passagersChip)
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Submit the form
      const submitButton = canvas.getByRole('button', { name: /calculer/i })
      await userEvent.click(submitButton)
    }
  },
}

/**
 * Erreur de chargement des stations.
 */
export const StationsLoadError: Story = {
  parameters: {
    docs: {
      description: {
        story: "Affichage d'une erreur lorsque les stations ne peuvent pas etre chargees.",
      },
    },
  },
  decorators: [
    (story) => {
      window.__STORYBOOK_SCENARIO__ = 'stations-error'
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
 * Erreur de calcul d'itineraire.
 */
export const RouteCalculationError: Story = {
  parameters: {
    docs: {
      description: {
        story: "Erreur affichee quand aucun chemin n'est trouve entre les stations.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Set error scenario for route calculation
    window.__STORYBOOK_SCENARIO__ = 'route-error'

    const fromInput = canvasElement.querySelector(
      '[data-testid="from-station"] input'
    ) as HTMLInputElement
    const toInput = canvasElement.querySelector(
      '[data-testid="to-station"] input'
    ) as HTMLInputElement

    if (fromInput && toInput) {
      // Select stations
      await userEvent.click(fromInput)
      await new Promise((resolve) => setTimeout(resolve, 300))
      await userEvent.type(fromInput, 'Mon')
      await new Promise((resolve) => setTimeout(resolve, 300))
      const fromOptions = document.querySelectorAll('.v-list-item')
      if (fromOptions.length > 0) {
        await userEvent.click(fromOptions[0] as HTMLElement)
      }
      await new Promise((resolve) => setTimeout(resolve, 300))

      await userEvent.click(toInput)
      await new Promise((resolve) => setTimeout(resolve, 300))
      await userEvent.type(toInput, 'Gst')
      await new Promise((resolve) => setTimeout(resolve, 300))
      const toOptions = document.querySelectorAll('.v-list-item')
      if (toOptions.length > 0) {
        await userEvent.click(toOptions[0] as HTMLElement)
      }
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Select type
      const passagersChip = canvas.getByText('Passagers')
      await userEvent.click(passagersChip)
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Submit - will trigger error
      const submitButton = canvas.getByRole('button', { name: /calculer/i })
      await userEvent.click(submitButton)

      // Reset scenario
      await new Promise((resolve) => setTimeout(resolve, 500))
      window.__STORYBOOK_SCENARIO__ = 'default'
    }
  },
}
