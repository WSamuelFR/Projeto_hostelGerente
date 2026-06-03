/**
 * hostelGerente - Inicializador da Aplicação Vue 3 (Renderer Process)
 * Caminho: src/renderer.ts
 */

import { createApp, ref, onMounted } from 'vue';

// Importações Globais de Estilo (Bootstrap 5 + Ícones)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importação das duas telas raiz do sistema
import LoginView from '../public/view/login/login.vue';
import MainHeaderLayout from '../public/view/dashboard/header.vue';

// Componente Root App: Implementa Roteamento Simples e Seguro via Hash
const App = {
  template: `
    <div>
      <!-- Renderiza a tela de login caso a rota seja login, ou o Dashboard se autenticado -->
      <LoginView v-if="currentRoute === 'login'" />
      <MainHeaderLayout v-else />
    </div>
  `,
  components: {
    LoginView,
    MainHeaderLayout
  },
  setup() {
    const currentRoute = ref('login');

    // Atualiza a rota com base na hashtag da URL
    const updateRoute = () => {
      const hash = window.location.hash;
      const loggedUser = sessionStorage.getItem('usuario_logado');
      
      if (hash === '#/dashboard' && loggedUser) {
        currentRoute.value = 'dashboard';
      } else {
        // Fallback de segurança para o Login
        currentRoute.value = 'login';
        window.location.hash = '#/login';
      }
    };

    onMounted(() => {
      window.addEventListener('hashchange', updateRoute);
      updateRoute();
    });

    return {
      currentRoute
    };
  }
};

// Inicializa a aplicação Vue
createApp(App).mount('#app');
