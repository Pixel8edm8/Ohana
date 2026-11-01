/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
  // Add more env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}