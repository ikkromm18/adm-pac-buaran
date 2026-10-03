/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAS_DEPLOYMENT_ID: string
  readonly VITE_GAS_API_URL: string
  readonly VITE_APP_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
