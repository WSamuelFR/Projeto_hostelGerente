<template>
  <div class="container-fluid py-4 min-vh-100 transition-theme" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    <div class="container max-width-card">
      
      <!-- Cabeçalho com Título e Switch de Modo Escuro -->
      <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
        <h2 class="h3 mb-0 fw-bold d-flex align-items-center text-primary-emphasis">
          <i class="bi bi-person-plus-fill me-2"></i>
          Cadastro de Hóspede
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
        <!-- Navegação de Abas (PF vs PJ) -->
        <div class="card-header bg-body-tertiary border-0 p-0">
          <ul class="nav nav-tabs nav-justified border-0" id="guestTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link py-3 fw-bold border-0 rounded-0 d-flex align-items-center justify-content-center text-uppercase"
                :class="{ active: activeTab === 'PF' }"
                id="pf-tab"
                type="button"
                role="tab"
                @click="setTab('PF')"
              >
                <i class="bi bi-person-fill me-2"></i>
                Pessoa Física (CPF)
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link py-3 fw-bold border-0 rounded-0 d-flex align-items-center justify-content-center text-uppercase"
                :class="{ active: activeTab === 'PJ' }"
                id="pj-tab"
                type="button"
                role="tab"
                @click="setTab('PJ')"
              >
                <i class="bi bi-building-fill me-2"></i>
                Pessoa Jurídica (CNPJ)
              </button>
            </li>
          </ul>
        </div>

        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="handleSubmit" novalidate>
            
            <!-- FORMULÁRIO PESSOA FÍSICA -->
            <div v-if="activeTab === 'PF'" class="row g-3">
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
                    v-model="pfData.nome_completo"
                    @input="handleNameInput('pfData', 'nome_completo', $event)"
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
                    v-model="pfData.cpf"
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
                    v-model="pfData.rg"
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
                    v-model="pfData.data_nascimento"
                  />
                </div>
              </div>

              <!-- Telefone -->
              <div class="col-md-4">
                <label for="telefonePF" class="form-label fw-semibold">Telefone</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-telephone text-secondary"></i></span>
                  <input
                    type="tel"
                    class="form-control border-start-0 ps-0"
                    id="telefonePF"
                    placeholder="(00) 00000-0000"
                    v-model="pfData.telefone"
                    @input="maskPhone('pfData')"
                  />
                </div>
              </div>

              <!-- Email -->
              <div class="col-md-4">
                <label for="emailPF" class="form-label fw-semibold">Email</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-envelope text-secondary"></i></span>
                  <input
                    type="email"
                    class="form-control border-start-0 ps-0"
                    id="emailPF"
                    placeholder="exemplo@email.com"
                    v-model="pfData.email"
                  />
                </div>
              </div>
            </div>

            <!-- FORMULÁRIO PESSOA JURÍDICA -->
            <div v-else class="row g-3">
              <!-- CNPJ -->
              <div class="col-md-12">
                <label for="cnpj" class="form-label fw-semibold">CNPJ <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-building text-secondary"></i></span>
                  <input
                    type="text"
                    class="form-control border-start-0 border-end-0 ps-0"
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    v-model="pjData.cnpj"
                    @input="maskCNPJ"
                    required
                  />
                  <button
                    class="btn btn-outline-primary px-4 fw-semibold"
                    type="button"
                    id="btnBuscarCNPJ"
                    :disabled="isSearchingCnpj || !isCnpjLengthValid"
                    @click="fetchCnpjData"
                  >
                    <span v-if="isSearchingCnpj" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-search me-1"></i>
                    Buscar CNPJ
                  </button>
                </div>
                <div class="form-text text-secondary-emphasis">Digite os 14 números do CNPJ para buscar os dados automaticamente.</div>
              </div>

              <!-- Razão Social -->
              <div class="col-md-6">
                <label for="razaoSocial" class="form-label fw-semibold">Razão Social <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-card-heading text-secondary"></i></span>
                  <input
                    type="text"
                    class="form-control border-start-0 ps-0"
                    id="razaoSocial"
                    placeholder="DIGITE A RAZÃO SOCIAL"
                    v-model="pjData.razao_social"
                    @input="handleNameInput('pjData', 'razao_social', $event)"
                    required
                  />
                </div>
              </div>

              <!-- Nome Fantasia -->
              <div class="col-md-6">
                <label for="nomeFantasia" class="form-label fw-semibold">Nome Fantasia</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-tag text-secondary"></i></span>
                  <input
                    type="text"
                    class="form-control border-start-0 ps-0"
                    id="nomeFantasia"
                    placeholder="DIGITE O NOME FANTASIA"
                    v-model="pjData.nome_fantasia"
                    @input="handleNameInput('pjData', 'nome_fantasia', $event)"
                  />
                </div>
              </div>

              <!-- Data de Fundação -->
              <div class="col-md-4">
                <label for="dataFundacao" class="form-label fw-semibold">Data de Fundação</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-calendar3 text-secondary"></i></span>
                  <input
                    type="date"
                    class="form-control border-start-0 ps-0"
                    id="dataFundacao"
                    v-model="pjData.data_fundacao"
                  />
                </div>
              </div>

              <!-- Telefone -->
              <div class="col-md-4">
                <label for="telefonePJ" class="form-label fw-semibold">Telefone</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-telephone text-secondary"></i></span>
                  <input
                    type="tel"
                    class="form-control border-start-0 ps-0"
                    id="telefonePJ"
                    placeholder="(00) 00000-0000"
                    v-model="pjData.telefone"
                    @input="maskPhone('pjData')"
                  />
                </div>
              </div>

              <!-- Email -->
              <div class="col-md-4">
                <label for="emailPJ" class="form-label fw-semibold">Email</label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-envelope text-secondary"></i></span>
                  <input
                    type="email"
                    class="form-control border-start-0 ps-0"
                    id="emailPJ"
                    placeholder="exemplo@empresa.com"
                    v-model="pjData.email"
                  />
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
                <i v-else class="bi bi-check-circle me-1"></i> Salvar Cadastro
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';

// Definição da interface de retorno do backend
interface ResponseData {
  success: boolean;
  message: string;
  data?: any;
}

export default defineComponent({
  name: 'CadastroHospede',
  setup() {
    // Estado de Tema (Modo Escuro / Claro)
    const isDarkMode = ref(false);

    // Estado da Aba Ativa
    const activeTab = ref<'PF' | 'PJ'>('PF');

    // Estados de Processamento
    const isSearchingCnpj = ref(false);
    const isSubmitting = ref(false);

    // Controle de Alerta
    const alert = reactive({
      show: false,
      type: 'success',
      title: '',
      message: ''
    });

    // Dados do Formulário Pessoa Física
    const pfData = reactive({
      nome_completo: '',
      rg: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      email: ''
    });

    // Dados do Formulário Pessoa Jurídica
    const pjData = reactive({
      nome_fantasia: '',
      razao_social: '',
      cnpj: '',
      data_fundacao: '',
      telefone: '',
      email: ''
    });

    // Validador de tamanho para liberar o botão de busca de CNPJ
    const isCnpjLengthValid = computed(() => {
      const clean = pjData.cnpj.replace(/[^\d]/g, '');
      return clean.length === 14;
    });

    // Ciclo de vida - Carregar preferência de tema
    onMounted(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        isDarkMode.value = true;
      } else if (savedTheme === 'light') {
        isDarkMode.value = false;
      } else {
        // Fallback para preferência do sistema
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      toggleThemeDOM();
    });

    // Alternar tema e salvar no localStorage
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

    const setTab = (tab: 'PF' | 'PJ') => {
      activeTab.value = tab;
      closeAlert();
    };

    // Filtro para aceitar apenas letras nos nomes e forçar maiúsculas
    const handleNameInput = (formType: 'pfData' | 'pjData', field: string, event: Event) => {
      const input = event.target as HTMLInputElement;
      // Permite apenas letras com acentos, cedilha e espaços
      let filtered = input.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
      filtered = filtered.toUpperCase();
      
      if (formType === 'pfData') {
        (pfData as any)[field] = filtered;
      } else {
        (pjData as any)[field] = filtered;
      }
      // Força a atualização do input no DOM
      input.value = filtered;
    };

    // Máscara de CPF: 000.000.000-00
    const maskCPF = () => {
      let val = pfData.cpf.replace(/[^\d]/g, '');
      if (val.length > 11) val = val.substring(0, 11);
      
      let formatted = '';
      if (val.length > 0) formatted += val.substring(0, 3);
      if (val.length > 3) formatted += '.' + val.substring(3, 6);
      if (val.length > 6) formatted += '.' + val.substring(6, 9);
      if (val.length > 9) formatted += '-' + val.substring(9, 11);
      
      pfData.cpf = formatted;
    };

    // Máscara de CNPJ: 00.000.000/0000-00
    const maskCNPJ = () => {
      let val = pjData.cnpj.replace(/[^\d]/g, '');
      if (val.length > 14) val = val.substring(0, 14);
      
      let formatted = '';
      if (val.length > 0) formatted += val.substring(0, 2);
      if (val.length > 2) formatted += '.' + val.substring(2, 5);
      if (val.length > 5) formatted += '.' + val.substring(5, 8);
      if (val.length > 8) formatted += '/' + val.substring(8, 12);
      if (val.length > 12) formatted += '-' + val.substring(12, 14);
      
      pjData.cnpj = formatted;
    };

    // Máscara de RG: 00.000.000-0
    const maskRG = () => {
      let val = pfData.rg.replace(/[^\dX]/g, ''); // RG pode ter dígito verificador X
      if (val.length > 9) val = val.substring(0, 9);
      
      let formatted = '';
      if (val.length > 0) formatted += val.substring(0, 2);
      if (val.length > 2) formatted += '.' + val.substring(2, 5);
      if (val.length > 5) formatted += '.' + val.substring(5, 8);
      if (val.length > 8) formatted += '-' + val.substring(8, 9);
      
      pfData.rg = formatted;
    };

    // Máscara de Telefone: (00) 00000-0000 ou (00) 0000-0000
    const maskPhone = (formType: 'pfData' | 'pjData') => {
      const data = formType === 'pfData' ? pfData : pjData;
      let val = data.telefone.replace(/[^\d]/g, '');
      if (val.length > 11) val = val.substring(0, 11);
      
      let formatted = '';
      if (val.length > 0) {
        formatted += '(' + val.substring(0, 2);
      }
      if (val.length > 2) {
        formatted += ') ' + val.substring(2, 6);
      }
      if (val.length > 6) {
        // Se tem 11 dígitos, é celular: (XX) XXXXX-XXXX. Se tem 10, é fixo: (XX) XXXX-XXXX
        if (val.length === 11) {
          formatted = '(' + val.substring(0, 2) + ') ' + val.substring(2, 7) + '-' + val.substring(7, 11);
        } else {
          formatted = '(' + val.substring(0, 2) + ') ' + val.substring(2, 6) + '-' + val.substring(6, 10);
        }
      }
      
      data.telefone = formatted;
    };

    // Fechar Alertas
    const closeAlert = () => {
      alert.show = false;
    };

    const triggerAlert = (type: 'success' | 'danger' | 'warning', title: string, message: string) => {
      alert.type = type;
      alert.title = title;
      alert.message = message;
      alert.show = true;
      // Scroll para o topo para ver o alerta
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Busca de CNPJ via API da BrasilAPI
    const fetchCnpjData = async () => {
      const rawCnpj = pjData.cnpj.replace(/[^\d]/g, '');
      if (rawCnpj.length !== 14) return;

      isSearchingCnpj.value = true;
      closeAlert();

      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`);
        if (!response.ok) {
          throw new Error('Empresa não encontrada na base da Receita Federal.');
        }

        const data = await response.json();
        
        // Preenchimento automático dos dados recebidos
        pjData.razao_social = (data.razao_social || '').toUpperCase();
        pjData.nome_fantasia = (data.nome_fantasia || '').toUpperCase();
        
        if (data.ddd_telefone_1) {
          pjData.telefone = data.ddd_telefone_1;
          maskPhone('pjData');
        }
        if (data.email) {
          pjData.email = data.email.toLowerCase();
        }

        triggerAlert('success', 'CNPJ Encontrado!', 'Os dados cadastrais da empresa foram preenchidos automaticamente.');

      } catch (err: any) {
        triggerAlert('danger', 'Erro na Busca:', err.message || 'Houve uma falha ao conectar com a API de CNPJ.');
      } finally {
        isSearchingCnpj.value = false;
      }
    };

    // Resetar Formulários
    const resetForm = () => {
      if (activeTab.value === 'PF') {
        pfData.nome_completo = '';
        pfData.rg = '';
        pfData.cpf = '';
        pfData.data_nascimento = '';
        pfData.telefone = '';
        pfData.email = '';
      } else {
        pjData.nome_fantasia = '';
        pjData.razao_social = '';
        pjData.cnpj = '';
        pjData.data_fundacao = '';
        pjData.telefone = '';
        pjData.email = '';
      }
      closeAlert();
    };

    // Envio do formulário
    const handleSubmit = async () => {
      closeAlert();
      isSubmitting.value = true;

      try {
        let payload: any = null;

        if (activeTab.value === 'PF') {
          if (!pfData.nome_completo || !pfData.cpf) {
            triggerAlert('warning', 'Atenção:', 'Nome Completo e CPF são campos obrigatórios.');
            isSubmitting.value = false;
            return;
          }
          payload = {
            tipo: 'PF',
            nome_completo: pfData.nome_completo,
            rg: pfData.rg,
            cpf: pfData.cpf,
            data_nascimento: pfData.data_nascimento,
            telefone: pfData.telefone,
            email: pfData.email
          };
        } else {
          if (!pjData.razao_social || !pjData.cnpj) {
            triggerAlert('warning', 'Atenção:', 'Razão Social e CNPJ são campos obrigatórios.');
            isSubmitting.value = false;
            return;
          }
          payload = {
            tipo: 'PJ',
            nome_fantasia: pjData.nome_fantasia,
            razao_social: pjData.razao_social,
            cnpj: pjData.cnpj,
            data_fundacao: pjData.data_fundacao,
            telefone: pjData.telefone,
            email: pjData.email
          };
        }

        // COMUNICAÇÃO COM O BACKEND
        // Em um sistema real (Electron/IPC ou API Node), faremos a chamada abaixo.
        // Simulamos a integração com 'cadastro_hospede.ts' importado de forma assíncrona ou chamando o processo IPC.
        
        let response: ResponseFormat;

        // Se estivermos em ambiente Node/Electron com suporte direto a IPC:
        if ((window as any).api && (window as any).api.cadastrarHospede) {
          response = await (window as any).api.cadastrarHospede(payload);
        } else {
          // Fallback de desenvolvimento: integração mockada ou chamada dinâmica de modulo.
          // Aqui, tentamos carregar dinamicamente o arquivo ou simular.
          // Para validação visual do fluxo:
          console.log('Dados enviados ao backend:', payload);
          
          // Simulando o processo do backend:
          // 1. Validando CPF no client-side para resposta imediata
          if (payload.tipo === 'PF') {
            const cleanCPF = payload.cpf.replace(/[^\d]/g, '');
            // Validador simples duplicado na UI para UX imediata
            if (cleanCPF.length !== 11) {
              response = { success: false, message: 'CPF deve conter 11 dígitos.' };
            } else {
              // Simulação de delay de banco
              await new Promise(resolve => setTimeout(resolve, 800));
              response = { success: true, message: 'Hóspede cadastrado com sucesso (Simulação Local).' };
            }
          } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            response = { success: true, message: 'Hóspede cadastrado com sucesso (Simulação Local).' };
          }
        }

        if (response.success) {
          triggerAlert('success', 'Sucesso!', response.message);
          resetForm();
        } else {
          triggerAlert('danger', 'Erro no Cadastro:', response.message);
        }

      } catch (err: any) {
        triggerAlert('danger', 'Erro crítico:', err.message || 'Não foi possível cadastrar o hóspede.');
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      isDarkMode,
      activeTab,
      isSearchingCnpj,
      isSubmitting,
      alert,
      pfData,
      pjData,
      isCnpjLengthValid,
      toggleTheme,
      setTab,
      handleNameInput,
      maskCPF,
      maskCNPJ,
      maskRG,
      maskPhone,
      closeAlert,
      fetchCnpjData,
      resetForm,
      handleSubmit
    };
  }
});

interface ResponseFormat {
  success: boolean;
  message: string;
  data?: any;
}
</script>

<style scoped>
/* Estilos premium customizados complementando o Bootstrap 5 */
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

/* Glassmorphism sutil para o Card */
.card-glass {
  background: var(--bs-card-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--bs-border-color-translucent);
  transition: all 0.3s ease;
}

/* Efeitos de foco nos inputs */
.form-control:focus, .input-group-text:focus {
  border-color: var(--bs-primary-border-subtle);
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

.input-group-text {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

/* Botões interativos */
.btn-scale {
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}

.btn-scale:active {
  transform: scale(0.98);
}

/* Customização das abas ativas */
.nav-tabs .nav-link {
  color: var(--bs-secondary-color);
  background-color: transparent;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  color: var(--bs-primary);
  background-color: var(--bs-secondary-bg-subtle);
}

.nav-tabs .nav-link.active {
  color: var(--bs-primary);
  background-color: var(--bs-card-bg);
  border-bottom: 3px solid var(--bs-primary) !important;
}
</style>
