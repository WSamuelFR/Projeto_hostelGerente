import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // Ponto de entrada do Processo Principal do Electron
        entry: 'src/main.ts',
      },
      {
        // Ponto de entrada do Script Preload (Segurança)
        entry: 'src/preload.ts',
        onstart(options) {
          // Recarrega a janela do renderer quando o preload sofrer alterações
          options.reload();
        },
      },
    ]),
  ],
});
