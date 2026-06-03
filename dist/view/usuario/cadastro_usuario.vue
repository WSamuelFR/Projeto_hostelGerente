<template>
  <div class="container-fluid py-4 min-vh-100 transition-theme" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    <div class="container max-width-card">
      
      <!-- Cabeçalho com Título e Switch de Modo Escuro -->
      <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
        <h2 class="h3 mb-0 fw-bold d-flex align-items-center text-primary-emphasis">
          <i class="bi bi-person-badge-fill me-2"></i>
          Cadastro de Funcionário / Usuário
        </h2>
        <div class="form-check form-switch d-flex align-items-center">
          <i class="bi bi-sun-fill me-2 text-warning" v-if="!isDarkMode"></i>
          <i class="bi bi-moon-stars-fill me-2 text-primary" v-else></i>
          <input
            class="form-check-input theme-toggle-switch cursor-pointer"
            type="checkbox"
            role="switch"
            id="themeToggle"
            v-model="isDarkMode"
            @change="toggleTheme"
          />
          <label class="form-check-label ms-2 fw-semibold text-secondary" for="themeToggle">
            {{ isDarkMode ? 'Modo Escuro' : 'Modo Claro' }}
          </label>
        </div>
      </div>

      <!-- Alertas de Feedback -->
      <div v-if="alert.show" :class="['alert alert-dismissible fade show', `alert-${alert.type}`]" role="alert">
        <i :class="['bi me-2', alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill']"></i>
        <strong>{{ alert.title }}</strong> {{ alert.message }}
        <button type="button" class="btn-close" @click="closeAlert" aria-label="Close"></button>
      </div>

      <!-- Card Principal -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden card-glass">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="handleSubmit" novalidate>
            
            <!-- SEÇÃO 1: DADOS PESSOAIS -->
            <h5 class="fw-bold mb-4 text-primary d-flex align-items-center">
              <span class="badge bg-primary me-2">1</span>
              Dados Pessoais
            </h5>
            
            <div class="row g-3 mb-5">
              <!-- Nome Completo -->
              <div class="col-md-12">
                <label for="nomeCompleto" class="form-label fw-semibold">Nome Completo <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-person text-secondary"></i></span>
                  <input
                    type="text"
                    class="form-control border-start-0 ps-0"
                    id="nomeCompleto"
                    placeholder="DIGITE O NOME COMPLETO"
                    v-model="formData.nome_completo"
                    @input="handleNameInput"
                    required
                  />
                </div>
              </div>

              <!-- CPF -->
              <div class="col-md-6">
                <label for="cpf" class="form-label fw-semibold">CPF <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-card-text text-secondary"></i></span>
                  <input
                    type="text"
                    class="form-control border-start-0 ps-0"
                    id="cpf"
                    placeholder="000.000.000-00"
                    v-model="formData.cpf"
                    @input="maskCPF"
                    required
                  />
                </div>
              </div>

              <!-- RG -->
              <div class="col-md-6">
                <label for="rg" class="form-label fw-semibold">RG</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-file-earmark-person text-secondary"></i></span>
                  <input
                    type="text"
                    class="form-control border-start-0 ps-0"
                    id="rg"
                    placeholder="00.000.000-0"
                    v-model="formData.rg"
                    @input="maskRG"
                  />
                </div>
              </div>

              <!-- Data de Nascimento -->
              <div class="col-md-4">
                <label for="dataNascimento" class="form-label fw-semibold">Data de Nascimento</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-calendar-event text-secondary"></i></span>
                  <input
                    type="date"
                    class="form-control border-start-0 ps-0"
                    id="dataNascimento"
                    v-model="formData.data_nascimento"
                  />
                </div>
              </div>

              <!-- Telefone -->
              <div class="col-md-4">
                <label for="telefone" class="form-label fw-semibold">Telefone</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-telephone text-secondary"></i></span>
                  <input
                    type="tel"
                    class="form-control border-start-0 ps-0"
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    v-model="formData.telefone"
                    @input="maskPhone"
                  />
                </div>
              </div>

              <!-- Email -->
              <div class="col-md-4">
                <label for="email" class="form-label fw-semibold">Email</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-envelope text-secondary"></i></span>
                  <input
                    type="email"
                    class="form-control border-start-0 ps-0"
                    id="email"
                    placeholder="exemplo@email.com"
                    v-model="formData.email"
                  />
                </div>
              </div>
            </div>

            <!-- SEÇÃO 2: DADOS DE ACESSO -->
            <h5 class="fw-bold mb-4 text-primary d-flex align-items-center">
              <span class="badge bg-primary me-2">2</span>
              Credenciais e Permissões
            </h5>

            <div class="row g-3">
              <!-- Nome de Usuário -->
              <div class="col-md-6">
                <label for="nomeUsuario" class="form-label fw-semibold">Nome de Usuário (Username) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-person-workspace text-secondary"></i></span>
                  <input
                    type="text"
                    class="form-control border-start-0 ps-0 text-uppercase"
                    id="nomeUsuario"
                    placeholder="EX: SAMUEL.OLIVEIRA"
                    v-model="formData.nome_usuario"
                    @input="handleUsernameInput"
                    required
                  />
                </div>
              </div>

              <!-- Nível de Acesso -->
              <div class="col-md-6">
                <label for="nivelAcesso" class="form-label fw-semibold">Nível de Acesso <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-shield-lock text-secondary"></i></span>
                  <select class="form-select border-start-0 ps-0" id="nivelAcesso" v-model="formData.nivel" required>
                    <option value="padrao">PADRÃO (RECEPÇÃO / OPERAÇÕES)</option>
                    <option value="admin">ADMINISTRADOR</option>
                  </select>
                </div>
              </div>

              <!-- Senha -->
              <div class="col-md-6">
                <label for="senha" class="form-label fw-semibold">Senha (Mínimo 6 caracteres) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-key text-secondary"></i></span>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control border-start-0 border-end-0 ps-0"
                    id="senha"
                    placeholder="Digite a senha"
                    v-model="formData.senha"
                    required
                  />
                  <button class="btn btn-outline-secondary border-start-0" type="button" @click="showPassword = !showPassword">
                    <i :class="['bi', showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill']"></i>
                  </button>
                </div>
              </div>

              <!-- Confirmar Senha -->
              <div class="col-md-6">
                <label for="confirmarSenha" class="form-label fw-semibold">Repita a Senha <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-key-fill text-secondary"></i></span>
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control border-start-0 border-end-0 ps-0"
                    id="confirmarSenha"
                    placeholder="Repita a senha"
                    v-model="formData.confirmar_senha"
                    required
                  />
                  <button class="btn btn-outline-secondary border-start-0" type="button" @click="showConfirmPassword = !showConfirmPassword">
                    <i :class="['bi', showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill']"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="d-flex justify-content-end gap-2 mt-5 pt-3 border-top border-secondary-subtle">
              <button type="button" class="btn btn-light px-4 py-2 fw-semibold rounded-3 text-secondary" @click="resetForm">
                <i class="bi bi-x-circle me-1"></i> Limpar
              </button>
              <button type="submit" class="btn btn-primary px-5 py-2 fw-bold rounded-3 shadow-sm btn-scale" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-person-check-fill me-1"></i> Salvar Funcionário
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';

interface ResponseFormat {
  success: boolean;
  message: string;
  data?: any;
}

export default defineComponent({
  name: 'CadastroUsuario',
  setup() {
    const isDarkMode = ref(false);
    const isSubmitting = ref(false);
    
    // Controles de visibilidade de senha
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    // Controles de Alerta
    const alert = reactive({
      show: false,
      type: 'success',
      title: '',
      message: ''
    });

    // Form data
    const formData = reactive({
      nome_completo: '',
      rg: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      email: '',
      nome_usuario: '',
      senha: '',
      confirmar_senha: '',
      nivel: 'padrao' as 'padrao' | 'admin'
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

    // Validações e Mascaras do Input
    const handleNameInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      let filtered = input.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
      filtered = filtered.toUpperCase();
      formData.nome_completo = filtered;
      input.value = filtered;
    };

    const handleUsernameInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      // Permite letras, números, ponto e underscore
      let filtered = input.value.replace(/[^a-zA-Z0-9._]/g, '');
      filtered = filtered.toUpperCase();
      formData.nome_usuario = filtered;
      input.value = filtered;
    };

    const maskCPF = () => {
      let val = formData.cpf.replace(/[^\d]/g, '');
      if (val.length > 11) val = val.substring(0, 11);
      
      let formatted = '';
      if (val.length > 0) formatted += val.substring(0, 3);
      if (val.length > 3) formatted += '.' + val.substring(3, 6);
      if (val.length > 6) formatted += '.' + val.substring(6, 9);
      if (val.length > 9) formatted += '-' + val.substring(9, 11);
      
      formData.cpf = formatted;
    };

    const maskRG = () => {
      let val = formData.rg.replace(/[^\dX]/g, '');
      if (val.length > 9) val = val.substring(0, 9);
      
      let formatted = '';
      if (val.length > 0) formatted += val.substring(0, 2);
      if (val.length > 2) formatted += '.' + val.substring(2, 5);
      if (val.length > 5) formatted += '.' + val.substring(5, 8);
      if (val.length > 8) formatted += '-' + val.substring(8, 9);
      
      formData.rg = formatted;
    };

    const maskPhone = () => {
      let val = formData.telefone.replace(/[^\d]/g, '');
      if (val.length > 11) val = val.substring(0, 11);
      
      let formatted = '';
      if (val.length > 0) formatted += '(' + val.substring(0, 2);
      if (val.length > 2) formatted += ') ' + val.substring(2, 6);
      if (val.length > 6) {
        if (val.length === 11) {
          formatted = '(' + val.substring(0, 2) + ') ' + val.substring(2, 7) + '-' + val.substring(7, 11);
        } else {
          formatted = '(' + val.substring(0, 2) + ') ' + val.substring(2, 6) + '-' + val.substring(6, 10);
        }
      }
      formData.telefone = formatted;
    };

    const triggerAlert = (type: 'success' | 'danger' | 'warning', title: string, message: string) => {
      alert.type = type;
      alert.title = title;
      alert.message = message;
      alert.show = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closeAlert = () => {
      alert.show = false;
    };

    const resetForm = () => {
      formData.nome_completo = '';
      formData.rg = '';
      formData.cpf = '';
      formData.data_nascimento = '';
      formData.telefone = '';
      formData.email = '';
      formData.nome_usuario = '';
      formData.senha = '';
      formData.confirmar_senha = '';
      formData.nivel = 'padrao';
      showPassword.value = false;
      showConfirmPassword.value = false;
      closeAlert();
    };

    // Submissão do Formulário
    const handleSubmit = async () => {
      closeAlert();
      
      // 1. Validação de senha local
      if (formData.senha.length < 6) {
        triggerAlert('warning', 'Atenção:', 'A senha deve conter no mínimo 6 caracteres.');
        return;
      }

      if (formData.senha !== formData.confirmar_senha) {
        triggerAlert('warning', 'Atenção:', 'As senhas informadas não correspondem.');
        return;
      }

      if (!formData.nome_completo || !formData.cpf || !formData.nome_usuario) {
        triggerAlert('warning', 'Atenção:', 'Nome Completo, CPF e Nome de Usuário são campos obrigatórios.');
        return;
      }

      isSubmitting.value = true;

      try {
        const payload = {
          nome_completo: formData.nome_completo,
          rg: formData.rg,
          cpf: formData.cpf,
          data_nascimento: formData.data_nascimento,
          telefone: formData.telefone,
          email: formData.email,
          nome_usuario: formData.nome_usuario,
          senha: formData.senha,
          nivel: formData.nivel
        };

        let response: ResponseFormat;

        // Integração real via Electron IPC
        if ((window as any).api && (window as any).api.cadastrarUsuario) {
          response = await (window as any).api.cadastrarUsuario(payload);
        } else {
          // Fallback Simulação Client-Side
          console.log('Enviando dados do usuário para o backend:', payload);
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const cleanCPF = payload.cpf.replace(/[^\d]/g, '');
          if (cleanCPF.length !== 11) {
            response = { success: false, message: 'CPF inválido.' };
          } else {
            response = { success: true, message: 'Funcionário cadastrado com sucesso (Simulação).' };
          }
        }

        if (response.success) {
          triggerAlert('success', 'Sucesso!', response.message);
          resetForm();
        } else {
          triggerAlert('danger', 'Erro no Cadastro:', response.message);
        }

      } catch (err: any) {
        triggerAlert('danger', 'Erro crítico:', err.message || 'Houve uma falha ao cadastrar o funcionário.');
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      isDarkMode,
      isSubmitting,
      showPassword,
      showConfirmPassword,
      alert,
      formData,
      toggleTheme,
      handleNameInput,
      handleUsernameInput,
      maskCPF,
      maskRG,
      maskPhone,
      closeAlert,
      resetForm,
      handleSubmit
    };
  }
});
</script>

<style scoped>
.max-width-card {
  max-width: 850px;
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

/* Glassmorphism sutil */
.card-glass {
  background: var(--bs-card-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--bs-border-color-translucent);
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus, .input-group-text:focus {
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
</style>
