<template>
  <div class="container-fluid py-4 min-vh-100 transition-theme" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    <div class="container max-width-card">
      
      <!-- Cabeçalho -->
      <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
        <h2 class="h3 mb-0 fw-bold d-flex align-items-center text-primary-emphasis">
          <i class="bi bi-box-arrow-in-right me-2 text-primary"></i>
          Registrar Check-in
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
            
            <div class="row g-3">
              <!-- Hóspede Principal -->
              <div class="col-md-12">
                <label for="hospedePrincipal" class="form-label fw-semibold">Hóspede Principal <span class="text-danger">*</span></label>
                <div class="position-relative">
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-search text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0"
                      placeholder="Pesquise por nome ou documento do hóspede..."
                      v-model="searchGuestQuery"
                      @focus="showGuestDropdown = true"
                      @input="filterGuests"
                    />
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      @click="clearSelectedGuest" 
                      v-if="selectedGuest"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                  
                  <!-- Dropdown Autocomplete de Hóspedes -->
                  <div 
                    v-if="showGuestDropdown && filteredGuests.length > 0" 
                    class="autocomplete-dropdown shadow-lg rounded-3 border border-secondary-subtle bg-body position-absolute w-100 z-3 overflow-auto"
                    style="max-height: 250px;"
                  >
                    <div 
                      v-for="g in filteredGuests" 
                      :key="g.id_hospedes"
                      class="dropdown-item p-3 cursor-pointer border-bottom border-light-subtle d-flex justify-content-between align-items-center"
                      @click="selectGuest(g)"
                    >
                      <div>
                        <strong class="text-body d-block">{{ g.nome }}</strong>
                        <small class="text-secondary">{{ g.tipo }}: {{ formatDocumentStr(g) }}</small>
                      </div>
                      <i class="bi bi-chevron-right text-secondary"></i>
                    </div>
                  </div>
                  <div 
                    v-else-if="showGuestDropdown && searchGuestQuery.trim() !== ''" 
                    class="autocomplete-dropdown shadow-lg rounded-3 border border-secondary-subtle bg-body position-absolute w-100 z-3 p-3 text-center text-secondary"
                  >
                    Nenhum hóspede cadastrado encontrado.
                  </div>
                </div>
              </div>

              <!-- Cartão de Informações do Hóspede Selecionado -->
              <div v-if="selectedGuest" class="col-md-12 animate-fade-in">
                <div class="p-3 bg-body-tertiary rounded-3 border border-primary-subtle d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <h6 class="fw-bold mb-1 text-primary"><i class="bi bi-person-check-fill me-1"></i> Hóspede Selecionado</h6>
                    <span class="d-block fw-semibold text-body">{{ selectedGuest.nome }}</span>
                    <small class="text-secondary d-block">Documento: {{ formatDocumentStr(selectedGuest) }}</small>
                  </div>
                  <div class="d-flex flex-column justify-content-center text-md-end text-secondary small">
                    <span v-if="selectedGuest.telefone" class="d-block"><i class="bi bi-telephone-fill me-1"></i> {{ selectedGuest.telefone }}</span>
                    <span v-if="selectedGuest.email" class="d-block"><i class="bi bi-envelope-fill me-1"></i> {{ selectedGuest.email }}</span>
                  </div>
                </div>
              </div>

              <!-- Quarto -->
              <div class="col-md-6">
                <label for="quarto" class="form-label fw-semibold">Quarto Disponível (Limpo) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-door-closed text-secondary"></i></span>
                  <select 
                    class="form-select border-start-0 ps-0" 
                    id="quarto" 
                    v-model="checkinData.id_quarto"
                    required
                  >
                    <option value="0" disabled>SELECIONE UM QUARTO</option>
                    <option v-for="q in quartosDisponiveis" :key="q.id_quarto" :value="q.id_quarto">
                      Quarto {{ q.numero }} - {{ q.modelo }} (Capacidade: {{ q.capacidade }})
                    </option>
                  </select>
                </div>
                <div v-if="quartosDisponiveis.length === 0" class="form-text text-danger fw-semibold">
                  <i class="bi bi-exclamation-triangle"></i> Não há quartos livres/limpos no momento.
                </div>
              </div>

              <!-- Data e Hora de Check-in -->
              <div class="col-md-6">
                <label for="dataCheckin" class="form-label fw-semibold">Data/Hora de Entrada <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-body border-end-0"><i class="bi bi-calendar-event text-secondary"></i></span>
                  <input
                    type="datetime-local"
                    class="form-control border-start-0 ps-0"
                    id="dataCheckin"
                    v-model="checkinData.data_hora_checkin"
                    required
                  />
                </div>
              </div>

              <!-- Sessão de Acompanhantes Adicionais -->
              <div class="col-md-12 mt-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="fw-bold mb-0 text-body-secondary"><i class="bi bi-people-fill me-1"></i> Acompanhantes (Opcional)</h5>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm rounded-pill fw-semibold btn-scale"
                    @click="addAcompanhante"
                    :disabled="!selectedGuest"
                  >
                    <i class="bi bi-plus-lg me-1"></i> Adicionar Acompanhante
                  </button>
                </div>

                <div v-if="checkinData.acompanhantes.length === 0" class="p-3 border border-dashed rounded-3 text-center text-secondary small bg-body-tertiary">
                  Nenhum acompanhante adicionado. Clique no botão acima para adicionar.
                </div>

                <!-- Lista de Acompanhantes adicionados -->
                <div v-else class="row g-3">
                  <div 
                    v-for="(ac, idx) in checkinData.acompanhantes" 
                    :key="idx" 
                    class="col-12 p-3 bg-body-tertiary rounded-3 border border-secondary-subtle position-relative animate-fade-in"
                  >
                    <!-- Remover Acompanhante -->
                    <button 
                      type="button" 
                      class="btn btn-sm btn-link text-danger position-absolute top-0 end-0 m-2 text-decoration-none"
                      @click="removeAcompanhante(idx)"
                    >
                      <i class="bi bi-trash fs-5"></i>
                    </button>

                    <div class="row g-3 me-4">
                      <!-- Seleção do Acompanhante -->
                      <div class="col-md-12">
                        <label class="form-label fw-semibold small mb-1">Selecione o Hóspede</label>
                        <select 
                          class="form-select" 
                          v-model="ac.id_hospedes"
                          @change="onAcompanhanteChange(idx)"
                        >
                          <option value="0" disabled>SELECIONE UM HÓSPEDE CADASTRADO</option>
                          <option 
                            v-for="g in availableForCompanions(ac.id_hospedes)" 
                            :key="g.id_hospedes" 
                            :value="g.id_hospedes"
                          >
                            {{ g.nome }} ({{ formatDocumentStr(g) }})
                          </option>
                        </select>
                      </div>

                      <!-- Dados mostrados automaticamente -->
                      <div class="col-md-6" v-if="ac.documento">
                        <small class="text-secondary d-block">Documento:</small>
                        <span class="fw-semibold text-body">{{ ac.documento }}</span>
                      </div>
                      <div class="col-md-6" v-if="ac.telefone || ac.email">
                        <small class="text-secondary d-block">Contato:</small>
                        <span class="fw-semibold text-body small">
                          {{ ac.telefone || '-' }} {{ ac.telefone && ac.email ? '|' : '' }} {{ ac.email || '' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="d-flex justify-content-end gap-2 mt-5 pt-3 border-top border-secondary-subtle">
              <button type="button" class="btn btn-light px-4 py-2 fw-semibold rounded-3 text-secondary" @click="resetForm">
                <i class="bi bi-x-circle me-1"></i> Limpar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary px-5 py-2 fw-bold rounded-3 shadow-sm btn-scale" 
                :disabled="isSubmitting || quartosDisponiveis.length === 0 || !selectedGuest"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-check-circle me-1"></i> Confirmar Check-in
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

interface Hospede {
  id_hospedes: number;
  id_hospede_pf: number | null;
  id_hospede_pj: number | null;
  tipo: 'PF' | 'PJ';
  nome: string;
  telefone: string | null;
  email: string | null;
  rg?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
}

interface Quarto {
  id_quarto: number;
  numero: string;
  modelo: string;
  capacidade: number;
  situacao: string;
}

interface AcompanhanteForm {
  id_hospedes: number;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
}

export default defineComponent({
  name: 'CadastroCheckin',
  setup() {
    const isDarkMode = ref(false);
    const isSubmitting = ref(false);
    const showGuestDropdown = ref(false);
    const searchGuestQuery = ref('');

    // Dados Carregados do Banco
    const hospedesList = ref<Hospede[]>([]);
    const quartosDisponiveis = ref<Quarto[]>([]);
    
    // Hóspede selecionado
    const selectedGuest = ref<Hospede | null>(null);

    // Controles de Alerta
    const alert = reactive({
      show: false,
      type: 'success',
      title: '',
      message: ''
    });

    const getNowStringForInput = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    };

    // Dados do Formulário
    const checkinData = reactive({
      id_quarto: 0,
      data_hora_checkin: getNowStringForInput(),
      acompanhantes: [] as AcompanhanteForm[]
    });

    onMounted(async () => {
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

      // Carrega dados iniciais do banco
      await fetchInitialData();
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

    const fetchInitialData = async () => {
      try {
        // Carrega Hóspedes
        if ((window as any).api && (window as any).api.listarHospedes) {
          hospedesList.value = await (window as any).api.listarHospedes();
        } else {
          hospedesList.value = [
            { id_hospedes: 1, id_hospede_pf: 101, id_hospede_pj: null, tipo: 'PF', nome: 'SAMUEL CARVALHO DE OLIVEIRA', cpf: '11144477735', telefone: '(11) 98765-4321', email: 'samuel@email.com' },
            { id_hospedes: 2, id_hospede_pf: null, id_hospede_pj: 201, tipo: 'PJ', nome: 'GOOGLE DEEPMIND BRASIL', cnpj: '00000000000191', telefone: '(11) 3003-4004', email: 'contato@deepmind.com' },
            { id_hospedes: 3, id_hospede_pf: 102, id_hospede_pj: null, tipo: 'PF', nome: 'ANA JULIA PEREIRA', cpf: '22255588849', telefone: '(21) 99888-7766', email: 'anajulia@email.com' }
          ];
        }

        // Carrega Quartos
        if ((window as any).api && (window as any).api.listarQuartos) {
          const list: Quarto[] = await (window as any).api.listarQuartos();
          // Filtra apenas os quartos "limpos"
          quartosDisponiveis.value = list.filter(q => q.situacao === 'limpo');
        } else {
          quartosDisponiveis.value = [
            { id_quarto: 1, numero: '101', modelo: 'simples', capacidade: 2, situacao: 'limpo' },
            { id_quarto: 2, numero: '102', modelo: 'suíte', capacidade: 4, situacao: 'limpo' }
          ];
        }
      } catch (err) {
        console.error(err);
        triggerAlert('danger', 'Erro de Carga:', 'Não foi possível carregar as informações do banco.');
      }
    };

    // Filtro autocomplete
    const filteredGuests = computed(() => {
      if (!searchGuestQuery.value.trim()) return [];
      const q = searchGuestQuery.value.toLowerCase().trim();
      return hospedesList.value.filter(g => {
        const doc = g.tipo === 'PF' ? (g.cpf || '') : (g.cnpj || '');
        return g.nome.toLowerCase().includes(q) || doc.includes(q);
      });
    });

    const filterGuests = () => {
      showGuestDropdown.value = true;
    };

    const selectGuest = (g: Hospede) => {
      selectedGuest.value = g;
      searchGuestQuery.value = g.nome;
      showGuestDropdown.value = false;
      closeAlert();
    };

    const clearSelectedGuest = () => {
      selectedGuest.value = null;
      searchGuestQuery.value = '';
      checkinData.acompanhantes = [];
      closeAlert();
    };

    const formatDocumentStr = (g: Hospede) => {
      if (g.tipo === 'PF') {
        const cpf = g.cpf || '';
        return cpf.length === 11 
          ? `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9, 11)}`
          : cpf;
      } else {
        const cnpj = g.cnpj || '';
        return cnpj.length === 14
          ? `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12, 14)}`
          : cnpj;
      }
    };

    // Acompanhantes
    const addAcompanhante = () => {
      checkinData.acompanhantes.push({
        id_hospedes: 0,
        nome: '',
        documento: '',
        telefone: '',
        email: ''
      });
    };

    const removeAcompanhante = (index: number) => {
      checkinData.acompanhantes.splice(index, 1);
    };

    const onAcompanhanteChange = (idx: number) => {
      const companionId = checkinData.acompanhantes[idx].id_hospedes;
      const originalGuest = hospedesList.value.find(g => g.id_hospedes === companionId);
      if (originalGuest) {
        checkinData.acompanhantes[idx].nome = originalGuest.nome;
        checkinData.acompanhantes[idx].documento = originalGuest.tipo === 'PF' ? (originalGuest.cpf || '') : (originalGuest.cnpj || '');
        checkinData.acompanhantes[idx].telefone = originalGuest.telefone || '';
        checkinData.acompanhantes[idx].email = originalGuest.email || '';
      }
    };

    // Retorna a lista de hóspedes disponíveis para acompanhantes (remove o hóspede principal e os já selecionados em outras linhas)
    const availableForCompanions = (currentSelectedId: number) => {
      return hospedesList.value.filter(g => {
        // Não pode ser o hóspede principal
        if (selectedGuest.value && g.id_hospedes === selectedGuest.value.id_hospedes) return false;
        
        // Não pode estar selecionado em outra vaga de acompanhante (exceto a atual)
        const isSelectedElsewhere = checkinData.acompanhantes.some(ac => ac.id_hospedes === g.id_hospedes && ac.id_hospedes !== currentSelectedId);
        return !isSelectedElsewhere;
      });
    };

    // Alertas
    const triggerAlert = (type: 'success' | 'danger' | 'warning', title: string, message: string) => {
      alert.type = type;
      alert.title = title;
      alert.message = message;
      alert.show = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closeAlert = () => { alert.show = false; };

    const resetForm = () => {
      clearSelectedGuest();
      checkinData.id_quarto = 0;
      checkinData.data_hora_checkin = getNowStringForInput();
      checkinData.acompanhantes = [];
      closeAlert();
    };

    // Submissão do formulário
    const handleSubmit = async () => {
      closeAlert();

      if (!selectedGuest.value) {
        triggerAlert('warning', 'Atenção:', 'Selecione o hóspede principal.');
        return;
      }

      if (!checkinData.id_quarto || checkinData.id_quarto === 0) {
        triggerAlert('warning', 'Atenção:', 'Selecione um quarto limpo.');
        return;
      }

      isSubmitting.value = true;

      try {
        // Puxa id_usuario logado
        let idUsuario = 1; // Fallback
        const savedUser = sessionStorage.getItem('usuario_logado');
        if (savedUser) {
          const userObj = JSON.parse(savedUser);
          idUsuario = userObj.id_usuario || 1;
        }

        // Formata data_hora_checkin: substitui 'T' por ' ' para ficar YYYY-MM-DD HH:MM
        const formattedCheckinDate = checkinData.data_hora_checkin.replace('T', ' ') + ':00';

        // Prepara acompanhantes válidos
        const acompanhantesValidos = checkinData.acompanhantes
          .filter(ac => ac.id_hospedes > 0)
          .map(ac => ({
            id_hospedes: ac.id_hospedes,
            nome: ac.nome,
            documento: ac.documento,
            telefone: ac.telefone,
            email: ac.email
          }));

        const payload = {
          id_hospedes: selectedGuest.value.id_hospedes,
          id_quarto: checkinData.id_quarto,
          id_usuario: idUsuario,
          nome: selectedGuest.value.nome,
          documento: selectedGuest.value.tipo === 'PF' ? selectedGuest.value.cpf : selectedGuest.value.cnpj,
          telefone: selectedGuest.value.telefone,
          email: selectedGuest.value.email,
          data_hora_checkin: formattedCheckinDate,
          acompanhantes: acompanhantesValidos
        };

        let response: { success: boolean; message: string };

        if ((window as any).api && (window as any).api.cadastrarCheckin) {
          response = await (window as any).api.cadastrarCheckin(payload);
        } else {
          console.log('Mock Payload:', payload);
          await new Promise(resolve => setTimeout(resolve, 800));
          response = { success: true, message: 'Check-in registrado com sucesso (Simulação Local).' };
        }

        if (response.success) {
          triggerAlert('success', 'Sucesso!', response.message);
          resetForm();
          // Atualiza a lista de quartos disponíveis
          await fetchInitialData();
        } else {
          triggerAlert('danger', 'Erro no Check-in:', response.message);
        }
      } catch (err: any) {
        triggerAlert('danger', 'Erro crítico:', err.message || 'Houve uma falha ao registrar o check-in.');
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      isDarkMode,
      isSubmitting,
      searchGuestQuery,
      showGuestDropdown,
      filteredGuests,
      selectedGuest,
      quartosDisponiveis,
      checkinData,
      alert,
      toggleTheme,
      filterGuests,
      selectGuest,
      clearSelectedGuest,
      formatDocumentStr,
      addAcompanhante,
      removeAcompanhante,
      onAcompanhanteChange,
      availableForCompanions,
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

.card-glass {
  background: var(--bs-card-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--bs-border-color-translucent);
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

.autocomplete-dropdown {
  z-index: 1050;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.dropdown-item:hover {
  background-color: var(--bs-secondary-bg-subtle);
}

.border-dashed {
  border-style: dashed !important;
  border-width: 2px !important;
}

.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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
</style>
