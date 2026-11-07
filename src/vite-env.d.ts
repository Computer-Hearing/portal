/// <reference types="vite/client" />

declare module '*.PNG' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_HOST?: string;
  readonly VITE_INFERENCE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
