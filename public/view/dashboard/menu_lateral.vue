<template>
  <aside class="d-flex flex-column justify-content-between p-3 border-end border-secondary-subtle sidebar-bg min-vh-100 shadow-sm" style="width: 280px;">
    
    <!-- Topo: Marca / Logotipo -->
    <div>
      <div class="d-flex align-items-center gap-2 mb-4 py-2 px-3">
        <div class="brand-logo-icon bg-primary text-white rounded-3">
          <i class="bi bi-house-door-fill"></i>
        </div>
        <div>
          <h5 class="fw-bold mb-0 text-body">hostelGerente</h5>
          <small class="text-secondary opacity-75 fs-xs">Administração Integrada</small>
        </div>
      </div>

      <!-- Informações do Usuário Logado -->
      <div class="user-profile-card p-3 rounded-4 bg-body-tertiary mb-4 border border-secondary-subtle">
        <div class="d-flex align-items-center gap-2">
          <div class="user-avatar bg-primary text-white font-weight-bold">
            {{ userInitials }}
          </div>
          <div class="overflow-hidden">
            <h6 class="fw-bold mb-0 text-truncate text-body" :title="usuario.nome_completo">{{ usuario.nome_completo }}</h6>
            <small class="badge rounded-pill text-uppercase" :class="usuario.nivel === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'">
              {{ usuario.nivel === 'admin' ? 'Administrador' : 'Recepcionista' }}
            </small>
          </div>
        </div>
      </div>

      <!-- Menu de Navegação -->
      <nav class="nav nav-pills flex-column gap-1">
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="nav-link py-2.5 px-3 fw-semibold text-start d-flex align-items-center gap-3 border-0 transition-all rounded-3"
          :class="activeItem === item.id ? 'active shadow-sm' : 'text-secondary bg-transparent hover-bg'"
          @click="selectItem(item.id)"
        >
          <i :class="['bi', item.icon, 'fs-5']"></i>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Rodapé: Toggler de Tema e Logout -->
    <div class="border-top border-secondary-subtle pt-3 mt-4">
      
      <!-- Alternador de Tema -->
      <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-body-tertiary border border-secondary-subtle mb-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-sun-fill text-warning fs-5" v-if="!isDarkMode"></i>
          <i class="bi bi-moon-stars-fill text-primary fs-5" v-else></i>
          <span class="fw-semibold text-secondary small">Tema</span>
        </div>
        <div class="form-check form-switch mb-0">
          <input
            class="form-check-input cursor-pointer"
            type="checkbox"
            role="switch"
            id="sidebarThemeToggle"
            v-model="isDarkMode"
            @change="toggleTheme"
          />
        </div>
      </div>

      <!-- Botão Sair (Logout) -->
      <button class="btn btn-outline-danger w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3 btn-scale" @click="handleLogout">
        <i class="bi bi-box-arrow-left"></i>
        <span>Sair do Sistema</span>
      </button>

    </div>

  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { obterItensMenu, MenuLateralItem } from '../../src/app/dashboard/gerencia_menu_lateral';

export default defineComponent({
  name: 'MenuLateral',
  props: {
    activeNavigation: {
      type: String,
      required: true
    }
  },
  emits: ['navigate', 'logout'],
  setup(props, { emit }) {
    const isDarkMode = ref(false);
    const activeItem = computed(() => props.activeNavigation);

    // Carrega dados do usuário do sessionStorage
    const usuario = ref({
      nome_completo: 'FUNCIONÁRIO',
      nivel: 'padrao' as 'admin' | 'padrao'
    });

    onMounted(() => {
      // Carrega dados do usuário logado
      const savedUser = sessionStorage.getItem('usuario_logado');
      if (savedUser) {
        usuario.value = JSON.parse(savedUser);
      }

      // Tema
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        isDarkMode.value = true;
      } else if (savedTheme === 'light') {
        isDarkMode.value = false;
      } else {
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      toggleThemeDOM();
    });

    // Iniciais do usuário para o avatar
    const userInitials = computed(() => {
      const parts = usuario.value.nome_completo.split(' ');
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      }
      return usuario.value.nome_completo.substring(0, 2).toUpperCase();
    });

    // Filtra itens do menu baseando-se no cargo
    const menuItems = computed<MenuLateralItem[]>(() => {
      return obterItensMenu(usuario.value.nivel);
    });

    const selectItem = (itemId: string) => {
      emit('navigate', itemId);
    };

    // Alternar tema e propagar globalmente no DOM
    const toggleTheme = () => {
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
      toggleThemeDOM();
    };

    const toggleThemeDOM = () => {
      const container = document.documentElement;
      if (isDarkMode.value) {
        container.setAttribute('data-bs-theme', 'dark');
      } else {
        container.setAttribute('data-bs-theme', 'light');
      }
    };

    const handleLogout = () => {
      emit('logout');
    };

    return {
      usuario,
      isDarkMode,
      activeItem,
      userInitials,
      menuItems,
      selectItem,
      toggleTheme,
      handleLogout
    };
  }
});
</script>

<style scoped>
.sidebar-bg {
  background-color: var(--bs-body-bg);
}

.brand-logo-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.user-profile-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.fs-xs {
  font-size: 0.75rem;
}

/* Hover nos botões de menu */
.hover-bg:hover {
  background-color: var(--bs-secondary-bg-subtle) !important;
  color: var(--bs-primary) !important;
}

.transition-all {
  transition: all 0.2s ease;
}

.btn-scale {
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}

.btn-scale:active {
  transform: scale(0.98);
}
</style>
