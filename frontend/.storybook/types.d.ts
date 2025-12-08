// Global type declarations for Storybook mock scenarios
declare global {
  interface Window {
    __STORYBOOK_SCENARIO__?: string
  }
}

export {}
