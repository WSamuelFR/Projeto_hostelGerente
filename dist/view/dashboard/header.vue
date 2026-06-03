<template>
  <div class="d-flex min-vh-100 transition-theme" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    
    <!-- Menu Lateral (Barra de Navegação) -->
    <MenuLateral
      :activeNavigation="activeNav"
      @navigate="handleNavigation"
      @logout="handleLogout"
    />

    <!-- Área de Conteúdo Principal -->
    <main class="flex-grow-1 d-flex flex-column bg-body-tertiary overflow-auto">
      
      <!-- HEADER FLUTUANTE / SUSPENSO DO DASHBOARD -->
      <!-- Visível apenas quando 'Dashboard' está selecionado no Menu Lateral -->
      <header v-if="activeNav === 'DASHBOARD'" class="bg-body border-bottom border-secondary-subtle px-4 py-3 shadow-sm sticky-top header-suspended animate-fade-in">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h4 class="fw-bold mb-0 text-primary-emphasis">Painel de Controle</h4>
            <small class="text-secondary">Selecione uma categoria para gerenciar registros</small>
          </div>
          
            <!-- Botões Estilo Abas Simplificados -->
            <div class="d-flex bg-body-tertiary p-1 rounded-3 border border-secondary-subtle">
              <button
                class="btn px-4 py-2 fw-bold text-uppercase tab-btn transition-all"
                :class="activeTab === 'hospede' ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'"
                @click="setTab('hospede')"
              >
                <i class="bi bi-people-fill me-2"></i>
                hospede
              </button>
              <button
                class="btn px-4 py-2 fw-bold text-uppercase tab-btn transition-all"
                :class="activeTab === 'usuarios' ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'"
                @click="setTab('usuarios')"
              >
                <i class="bi bi-person-badge-fill me-2"></i>
                usuarios
              </button>
              <button
                class="btn px-4 py-2 fw-bold text-uppercase tab-btn transition-all"
                :class="activeTab === 'quartos' ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'"
                @click="setTab('quartos')"
              >
                <i class="bi bi-door-closed-fill me-2"></i>
                quartos
              </button>
              <button
                class="btn px-4 py-2 fw-bold text-uppercase tab-btn transition-all"
                :class="activeTab === 'checkin' ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'"
                @click="setTab('checkin')"
              >
                <i class="bi bi-box-arrow-in-right me-2"></i>
                checkins
              </button>
            </div>
          </div>
        </header>

      <!-- Espaço de Renderização de Conteúdo Ativo -->
      <div class="flex-grow-1 p-4 position-relative">
        
        <!-- Renderização Condicional com base no estado de navegação -->
        <div class="animate-fade-in">
          
          <!-- Seção de Dashboard: Carrega as Telas de Gerenciamento através das abas do Header -->
          <div v-if="activeNav === 'DASHBOARD'">
            <GerenciaHospede v-if="activeTab === 'hospede'" />
            <GerenciaUsuario v-else-if="activeTab === 'usuarios'" />
            <GerenciaQuarto v-else-if="activeTab === 'quartos'" />
            <GerenciaCheckin v-else-if="activeTab === 'checkin'" />
          </div>

          <!-- Seção de Cadastros -->
          <div v-else-if="activeNav === 'CADASTRO_HOSPEDE'">
            <CadastroHospede />
          </div>

          <div v-else-if="activeNav === 'CADASTRO_USUARIO'">
            <CadastroUsuario />
          </div>

          <div v-else-if="activeNav === 'CADASTRO_QUARTO'">
            <CadastroQuarto />
          </div>

          <div v-else-if="activeNav === 'CADASTRO_CHECKIN'">
            <CadastroCheckin />
          </div>

        </div>

      </div>

    </main>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

// Importação dos componentes locais
import MenuLateral from './menu_lateral.vue';
import CadastroHospede from '../hospede/cadastro_hospede.vue';
import CadastroUsuario from '../usuario/cadastro_usuario.vue';
import GerenciaHospede from '../hospede/gerencia_hospede.vue';
import GerenciaUsuario from '../usuario/gerencia_usuario.vue';
import CadastroQuarto from '../quarto/cadastro_quarto.vue';
import GerenciaQuarto from '../quarto/gerencia_quarto.vue';
import CadastroCheckin from '../checkin/cadastro_checkin.vue';
import GerenciaCheckin from '../checkin/gerencia_checkin.vue';

export default defineComponent({
  name: 'MainHeaderLayout',
  components: {
    MenuLateral,
    CadastroHospede,
    CadastroUsuario,
    GerenciaHospede,
    GerenciaUsuario,
    CadastroQuarto,
    GerenciaQuarto,
    CadastroCheckin,
    GerenciaCheckin
  },
  setup() {
    const isDarkMode = ref(false);
    
    // Estado de Navegação Lateral
    const activeNav = ref<'DASHBOARD' | 'CADASTRO_HOSPEDE' | 'CADASTRO_USUARIO' | 'CADASTRO_QUARTO' | 'CADASTRO_CHECKIN'>('DASHBOARD');
    
    // Estado das abas do Header Flutuante
    const activeTab = ref<'hospede' | 'usuarios' | 'quartos' | 'checkin'>('hospede');

    onMounted(() => {
      // Verifica se o usuário está logado
      const loggedUser = sessionStorage.getItem('usuario_logado');
      if (!loggedUser && window.location.hash !== '#/login') {
        // Se não houver sessão ativa, redireciona para a tela de login
        window.location.hash = '#/login';
        window.location.reload();
      }

      // Sincroniza tema
      checkTheme();
      // Ouve mudanças de tema disparadas pelo menu lateral
      window.addEventListener('storage', checkTheme);
    });

    const checkTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      isDarkMode.value = savedTheme === 'dark';
    };

    // Altera o componente central
    const handleNavigation = (destination: 'DASHBOARD' | 'CADASTRO_HOSPEDE' | 'CADASTRO_USUARIO' | 'CADASTRO_QUARTO' | 'CADASTRO_CHECKIN') => {
      activeNav.value = destination;
    };
    
    // Altera a aba de gerenciamento no header flutuante
    const setTab = (tab: 'hospede' | 'usuarios' | 'quartos' | 'checkin') => {
      activeTab.value = tab;
    };

    // Processa encerramento de sessão
    const handleLogout = () => {
      sessionStorage.removeItem('usuario_logado');
      window.location.hash = '#/login';
      window.location.reload();
    };

    return {
      isDarkMode,
      activeNav,
      activeTab,
      handleNavigation,
      setTab,
      handleLogout
    };
  }
});
</script>

<style scoped>
.transition-theme {
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* Animação suave de entrada de subcomponentes */
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Flutuante / Suspenso */
.header-suspended {
  border-radius: 0 0 16px 16px;
  background-color: var(--bs-card-bg) !important;
  border-bottom: 1px solid var(--bs-border-color-translucent) !important;
  z-index: 1020;
}

/* Estilização das abas */
.tab-btn {
  border-radius: 8px;
  font-size: 0.9rem;
}

.btn-link:hover {
  color: var(--bs-primary) !important;
}

.transition-all {
  transition: all 0.25s ease;
}
</style>
