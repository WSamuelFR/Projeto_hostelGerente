/**
 * hostelGerente - TypeScript Declarations Shim for Vue SFCs
 * Caminho: src/env.d.ts
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
