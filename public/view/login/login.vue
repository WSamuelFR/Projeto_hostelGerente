<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center transition-theme bg-login-pattern" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    
    <!-- Botão Flutuante de Tema -->
    <div class="position-absolute top-0 end-0 m-4">
      <button class="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 border-secondary-subtle" @click="toggleTheme">
        <i class="bi bi-sun-fill text-warning" v-if="!isDarkMode"></i>
        <i class="bi bi-moon-stars-fill text-primary" v-else></i>
        <span>{{ isDarkMode ? 'Modo Escuro' : 'Modo Claro' }}</span>
      </button>
    </div>

    <!-- Container Principal do Card -->
    <div class="card shadow-lg border-0 rounded-4 card-login card-glass overflow-hidden">
      <div class="row g-0">
        
        <!-- Painel Decorativo Lateral (Wow Effect) -->
        <div class="col-md-5 d-none d-md-flex flex-column justify-content-between p-5 bg-gradient-login text-white">
          <div>
            <h3 class="fw-bold mb-1">hostelGerente</h3>
            <small class="opacity-75">Sistema Integrado de Gestão</small>
          </div>
          <div class="my-5">
            <h1 class="display-6 fw-bold lh-sm">Bem-vindo de volta!</h1>
            <p class="opacity-75 small mt-3">Gerencie quartos, hóspedes, usuários e vendas balcão de forma ágil e centralizada em uma única plataforma.</p>
          </div>
          <div>
            <small class="opacity-50">© 2026 - Versão 1.0.0</small>
          </div>
        </div>

        <!-- Formulário de Login -->
        <div class="col-md-7 p-4 p-md-5 d-flex flex-column justify-content-center">
          <div class="mb-4 text-center text-md-start">
            <h2 class="fw-bold text-body">Acesse sua Conta</h2>
            <p class="text-secondary small">Insira suas credenciais para entrar no painel administrativo</p>
          </div>

          <!-- Alert de Erro -->
          <div v-if="error.show" class="alert alert-danger alert-dismissible fade show border-0 shadow-sm rounded-3" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ error.message }}
            <button type="button" class="btn-close" @click="closeError" aria-label="Close"></button>
          </div>

          <form @submit.prevent="handleLogin" novalidate>
            <!-- Campo Usuário -->
            <div class="mb-3">
              <label for="username" class="form-label fw-semibold">Nome de Usuário</label>
              <div class="input-group">
                <span class="input-group-text bg-body border-end-0"><i class="bi bi-person-fill text-secondary"></i></span>
                <input
                  type="text"
                  class="form-control border-start-0 ps-0 text-uppercase"
                  id="username"
                  placeholder="DIGITE SEU USUÁRIO"
                  v-model="username"
                  @input="handleUsernameInput"
                  required
                />
              </div>
            </div>

            <!-- Campo Senha -->
            <div class="mb-4">
              <label for="password" class="form-label fw-semibold">Senha</label>
              <div class="input-group">
                <span class="input-group-text bg-body border-end-0"><i class="bi bi-lock-fill text-secondary"></i></span>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control border-start-0 border-end-0 ps-0"
                  id="password"
                  placeholder="Digite sua senha"
                  v-model="password"
                  required
                />
                <button class="btn btn-outline-secondary border-start-0" type="button" @click="showPassword = !showPassword">
                  <i :class="['bi', showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill']"></i>
                </button>
              </div>
            </div>

            <!-- Botão Entrar -->
            <button type="submit" class="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm btn-scale mt-2" :disabled="isLogging">
              <span v-if="isLogging" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              <span v-else><i class="bi bi-box-arrow-in-right me-1"></i> Acessar Painel</span>
            </button>
          </form>
        </div>

      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const isDarkMode = ref(false);
    const isLogging = ref(false);
    const showPassword = ref(false);

    const username = ref('');
    const password = ref('');

    const error = reactive({
      show: false,
      message: ''
    });

    onMounted(() => {
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

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
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

    const handleUsernameInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      let filtered = input.value.replace(/[^a-zA-Z0-9._]/g, '');
      filtered = filtered.toUpperCase();
      username.value = filtered;
      input.value = filtered;
    };

    const closeError = () => {
      error.show = false;
    };

    const handleLogin = async () => {
      closeError();

      if (!username.value.trim() || !password.value.trim()) {
        error.message = 'Preencha o nome de usuário e a senha.';
        error.show = true;
        return;
      }

      isLogging.value = true;

      try {
        const payload = {
          nome_usuario: username.value,
          senha: password.value
        };

        let response: { success: boolean; message: string; usuario?: any };

        // Conexão com o backend real do electron
        if ((window as any).api && (window as any).api.efetuarLogin) {
          response = await (window as any).api.efetuarLogin(payload);
        } else {
          // Simulação no Client-Side
          console.log('Dados de autenticação enviados ao backend:', payload);
          await new Promise(resolve => setTimeout(resolve, 800));
          
          if (payload.senha.length < 6) {
            response = { success: false, message: 'Senha inválida.' };
          } else {
            // Mock de Login de Sucesso
            response = {
              success: true,
              message: 'Autenticado com sucesso!',
              usuario: {
                id_usuario: 1,
                nome_completo: 'SAMUEL CARVALHO DE OLIVEIRA',
                nome_usuario: payload.nome_usuario,
                nivel: payload.nome_usuario === 'GERENTE' ? 'admin' : 'padrao'
              }
            };
          }
        }

        if (response.success && response.usuario) {
          // Salva os dados do usuário autenticado no sessionStorage
          sessionStorage.setItem('usuario_logado', JSON.stringify(response.usuario));
          
          // Redireciona o usuário para o layout principal (header.vue)
          // Em um SPA comum ou Electron app, alteramos o hash ou emitimos evento global
          if ((window as any).api && (window as any).api.navegarParaDashboard) {
            (window as any).api.navegarParaDashboard();
          } else {
            // Recarrega ou altera rota fictícia para testes locais
            window.location.hash = '#/dashboard';
            window.location.reload(); // Recarrega para iniciar a casca autenticada
          }
        } else {
          error.message = response.message || 'Credenciais inválidas.';
          error.show = true;
        }

      } catch (err: any) {
        error.message = err.message || 'Erro de conexão com o servidor de autenticação.';
        error.show = true;
      } finally {
        isLogging.value = false;
      }
    };

    return {
      isDarkMode,
      isLogging,
      showPassword,
      username,
      password,
      error,
      toggleTheme,
      handleUsernameInput,
      closeError,
      handleLogin
    };
  }
});
</script>

<style scoped>
.card-login {
  width: 100%;
  max-width: 850px;
  min-height: 480px;
}

/* Gradiente Premium */
.bg-gradient-login {
  background: linear-gradient(135deg, #0d6efd 0%, #0a4ebd 100%);
}

.transition-theme {
  transition: background-color 0.4s ease, color 0.4s ease;
}

.theme-toggle-switch {
  width: 3em !important;
  height: 1.6em !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Glassmorphism */
.card-glass {
  background: var(--bs-card-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--bs-border-color-translucent);
}

.form-control:focus, .input-group-text:focus {
  border-color: var(--bs-primary-border-subtle);
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

.input-group-text {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-scale {
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}

.btn-scale:active {
  transform: scale(0.98);
}

/* Efeito sutil de background */
.bg-login-pattern {
  background-color: var(--bs-body-bg);
  background-image: radial-gradient(var(--bs-border-color-translucent) 1px, transparent 1px);
  background-size: 24px 24px;
}
</style>
