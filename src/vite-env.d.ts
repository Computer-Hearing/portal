/// <reference types="vite/client" />

declare module '*.PNG' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
