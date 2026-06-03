/**
 * hostelGerente - Inicializador da Aplicação Vue 3 (Renderer Process)
 * Caminho: src/renderer.ts
 */

import { createApp, ref, onMounted, h } from 'vue';

// Importações Globais de Estilo (Bootstrap 5 + Ícones)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importação das duas telas raiz do sistema
import LoginView from '../public/view/login/login.vue';
import MainHeaderLayout from '../public/view/dashboard/header.vue';

// Componente Root App: Implementa Roteamento Simples e Seguro via Hash
const App = {
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
  },
  render() {
    return h('div', [
      this.currentRoute === 'login'
        ? h(LoginView)
        : h(MainHeaderLayout)
    ]);
  }
};

// Inicializa a aplicação Vue
createApp(App).mount('#app');
