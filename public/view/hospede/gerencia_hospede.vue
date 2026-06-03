<template>
  <div class="container-fluid py-4 min-vh-100 transition-theme" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    <div class="container">
      
      <!-- Cabeçalho -->
      <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
        <h2 class="h3 mb-0 fw-bold d-flex align-items-center text-primary-emphasis">
          <i class="bi bi-people-fill me-2"></i>
          Gerenciamento de Hóspedes
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

      <!-- Barra de Ferramentas: Pesquisa e Filtros -->
      <div class="row g-3 mb-4 align-items-center">
        <!-- Busca -->
        <div class="col-md-6 col-lg-5">
          <div class="input-group search-group shadow-sm rounded-3 overflow-hidden">
            <span class="input-group-text bg-body border-end-0"><i class="bi bi-search text-secondary"></i></span>
            <input
              type="text"
              class="form-control border-start-0 ps-0 py-2"
              placeholder="Pesquisar por nome, documento ou email..."
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- Filtro CPF / CNPJ (Abas de Filtro) -->
        <div class="col-md-6 col-lg-7 d-flex justify-content-md-end">
          <div class="btn-group shadow-sm rounded-3 overflow-hidden" role="group" aria-label="Filtro Tipo Hóspede">
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterType === 'TODOS' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterType('TODOS')"
            >
              Todos
            </button>
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterType === 'PF' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterType('PF')"
            >
              Física (CPF)
            </button>
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterType === 'PJ' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterType('PJ')"
            >
              Jurídica (CNPJ)
            </button>
          </div>
        </div>
      </div>

      <!-- Tabela Principal -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden card-glass">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-body-tertiary text-uppercase font-size-sm">
              <tr>
                <th scope="col" class="py-3 ps-4" style="width: 45%;">Nome</th>
                <th scope="col" class="py-3" style="width: 15%;">Tipo</th>
                <th scope="col" class="py-3" style="width: 25%;">Contato</th>
                <th scope="col" class="py-3 text-center" style="width: 15%;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredHospedes.length === 0">
                <td colspan="4" class="text-center py-5 text-secondary">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  Nenhum hóspede encontrado
                </td>
              </tr>
              <tr v-else v-for="h in filteredHospedes" :key="h.id_hospedes">
                <td class="py-3 ps-4">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3" :class="h.tipo === 'PF' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'">
                      <i :class="h.tipo === 'PF' ? 'bi bi-person' : 'bi bi-building'"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-body">{{ h.nome }}</div>
                      <small class="text-secondary">{{ formatDocument(h) }}</small>
                    </div>
                  </div>
                </td>
                <td class="py-3">
                  <span :class="['badge rounded-pill px-3 py-2 fw-bold text-uppercase', h.tipo === 'PF' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success']">
                    {{ h.tipo === 'PF' ? 'Física' : 'Jurídica' }}
                  </span>
                </td>
                <td class="py-3">
                  <div class="d-flex flex-column">
                    <span v-if="h.telefone" class="text-body"><i class="bi bi-telephone-fill me-1 text-secondary"></i> {{ h.telefone }}</span>
                    <span v-if="h.email" class="text-secondary small"><i class="bi bi-envelope-fill me-1 text-secondary"></i> {{ h.email }}</span>
                    <span v-if="!h.telefone && !h.email" class="text-secondary-emphasis small">-</span>
                  </div>
                </td>
                <td class="py-3 text-center">
                  <div class="d-flex justify-content-center gap-2">
                    <button
                      class="btn btn-outline-primary btn-sm px-3 rounded-pill fw-semibold btn-scale"
                      @click="openEditModal(h)"
                    >
                      <i class="bi bi-pencil-square me-1"></i> Editar
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm px-3 rounded-pill fw-semibold btn-scale"
                      @click="openDeleteModal(h)"
                    >
                      <i class="bi bi-trash-fill me-1"></i> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- MODAL DE EDIÇÃO -->
    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.65);" role="dialog">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4 card-glass">
          
          <div class="modal-header border-bottom border-secondary-subtle py-3 px-4">
            <h5 class="modal-title fw-bold text-primary-emphasis d-flex align-items-center">
              <i class="bi bi-pencil-square me-2 text-primary"></i>
              Alterar Dados do Hóspede
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Fechar"></button>
          </div>
          
          <div class="modal-body p-4">
            <div v-if="modalAlert.show" :class="['alert alert-dismissible fade show', `alert-${modalAlert.type}`]" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ modalAlert.message }}
              <button type="button" class="btn-close" @click="closeModalAlert" aria-label="Close"></button>
            </div>

            <form @submit.prevent="saveChanges" novalidate>
              <div v-if="modalData.tipo === 'PF'" class="row g-3">
                <div class="col-md-12">
                  <label for="modalNomeCompleto" class="form-label fw-semibold">Nome Completo <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-person text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0"
                      id="modalNomeCompleto"
                      v-model="modalData.nome_completo"
                      @input="handleNameInput('nome_completo', $event)"
                      required
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="modalCPF" class="form-label fw-semibold">CPF <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-card-text text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0"
                      id="modalCPF"
                      v-model="modalData.cpf"
                      @input="maskCPF"
                      required
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="modalRG" class="form-label fw-semibold">RG</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-file-earmark-person text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0"
                      id="modalRG"
                      v-model="modalData.rg"
                      @input="maskRG"
                    />
                  </div>
                </div>

                <div class="col-md-4">
                  <label for="modalDataNascimento" class="form-label fw-semibold">Data de Nascimento</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-calendar-event text-secondary"></i></span>
                    <input
                      type="date"
                      class="form-control border-start-0 ps-0"
                      id="modalDataNascimento"
                      v-model="modalData.data_nascimento"
                    />
                  </div>
                </div>

                <div class="col-md-4">
                  <label for="modalTelefonePF" class="form-label fw-semibold">Telefone</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-telephone text-secondary"></i></span>
                    <input
                      type="tel"
                      class="form-control border-start-0 ps-0"
                      id="modalTelefonePF"
                      v-model="modalData.telefone"
                      @input="maskPhone"
                    />
                  </div>
                </div>

                <div class="col-md-4">
                  <label for="modalEmailPF" class="form-label fw-semibold">Email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-envelope text-secondary"></i></span>
                    <input
                      type="email"
                      class="form-control border-start-0 ps-0"
                      id="modalEmailPF"
                      v-model="modalData.email"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="row g-3">
                <div class="col-md-12">
                  <label for="modalCNPJ" class="form-label fw-semibold">CNPJ <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-building text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 border-end-0 ps-0"
                      id="modalCNPJ"
                      v-model="modalData.cnpj"
                      @input="maskCNPJ"
                      required
                    />
                    <button
                      class="btn btn-outline-primary px-3 fw-semibold"
                      type="button"
                      :disabled="isSearchingCnpj || !isCnpjLengthValid"
                      @click="fetchCnpjData"
                    >
                      <span v-if="isSearchingCnpj" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      <i v-else class="bi bi-search me-1"></i>
                      Atualizar
                    </button>
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="modalRazaoSocial" class="form-label fw-semibold">Razão Social <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-card-heading text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0"
                      id="modalRazaoSocial"
                      v-model="modalData.razao_social"
                      @input="handleNameInput('razao_social', $event)"
                      required
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="modalNomeFantasia" class="form-label fw-semibold">Nome Fantasia</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-tag text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0"
                      id="modalNomeFantasia"
                      v-model="modalData.nome_fantasia"
                      @input="handleNameInput('nome_fantasia', $event)"
                    />
                  </div>
                </div>

                <div class="col-md-4">
                  <label for="modalDataFundacao" class="form-label fw-semibold">Data de Fundação</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-calendar3 text-secondary"></i></span>
                    <input
                      type="date"
                      class="form-control border-start-0 ps-0"
                      id="modalDataFundacao"
                      v-model="modalData.data_fundacao"
                    />
                  </div>
                </div>

                <div class="col-md-4">
                  <label for="modalTelefonePJ" class="form-label fw-semibold">Telefone</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-telephone text-secondary"></i></span>
                    <input
                      type="tel"
                      class="form-control border-start-0 ps-0"
                      id="modalTelefonePJ"
                      v-model="modalData.telefone"
                      @input="maskPhone"
                    />
                  </div>
                </div>

                <div class="col-md-4">
                  <label for="modalEmailPJ" class="form-label fw-semibold">Email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-envelope text-secondary"></i></span>
                    <input
                      type="email"
                      class="form-control border-start-0 ps-0"
                      id="modalEmailPJ"
                      v-model="modalData.email"
                    />
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
                <button type="button" class="btn btn-light px-4 py-2 fw-semibold text-secondary" @click="closeModal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary px-4 py-2 fw-bold shadow-sm btn-scale" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-save me-1"></i>
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE EXCLUSÃO COM CONFIRMAÇÃO DUPLA -->
    <div v-if="showDeleteModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.65);" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4 card-glass">
          
          <div class="modal-header border-bottom border-secondary-subtle py-3 px-4 bg-danger-subtle text-danger">
            <h5 class="modal-title fw-bold d-flex align-items-center">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Excluir Hóspede Permanentemente
            </h5>
            <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Fechar"></button>
          </div>
          
          <div class="modal-body p-4">
            <p class="text-body fs-5">
              Você está prestes a excluir o hóspede <strong>{{ deleteGuestTarget?.nome }}</strong>.
            </p>
            <p class="text-secondary small">
              Esta ação é definitiva e removerá permanentemente o cadastro e todo o histórico associado a este hóspede.
            </p>
            
            <!-- Confirmação de segurança -->
            <div class="form-check mt-4 p-3 border rounded border-warning bg-warning-subtle text-warning-emphasis">
              <input
                class="form-check-input ms-0 me-2"
                type="checkbox"
                id="consentCheckbox"
                v-model="deleteConsent"
              />
              <label class="form-check-label fw-semibold cursor-pointer" for="consentCheckbox">
                Confirmo que desejo excluir este hóspede e todos os seus registros permanentemente.
              </label>
            </div>
          </div>
          
          <div class="modal-footer border-top border-secondary-subtle p-3">
            <button type="button" class="btn btn-light px-4" @click="closeDeleteModal" :disabled="isDeleting">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger px-4 fw-bold shadow-sm"
              :disabled="!deleteConsent || isDeleting"
              @click="confirmDelete"
            >
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-trash-fill me-1"></i>
              Excluir Hóspede
            </button>
          </div>

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
  data_nascimento?: string | null;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  data_fundacao?: string | null;
}

export default defineComponent({
  name: 'GerenciaHospede',
  setup() {
    // Configurações Globais / Tema
    const isDarkMode = ref(false);
    const filterType = ref<'TODOS' | 'PF' | 'PJ'>('TODOS');
    const searchQuery = ref('');

    // Estado da Tabela
    const hospedes = ref<Hospede[]>([]);
    
    // Controles de Alerta da Tela
    const alert = reactive({
      show: false,
      type: 'success',
      title: '',
      message: ''
    });

    // Estados dos Modais
    const showModal = ref(false);
    const showDeleteModal = ref(false);
    
    const isSaving = ref(false);
    const isDeleting = ref(false);
    const isSearchingCnpj = ref(false);
    
    // Controles de Exclusão
    const deleteGuestTarget = ref<Hospede | null>(null);
    const deleteConsent = ref(false);

    // Controles de Alerta do Modal de Edição
    const modalAlert = reactive({
      show: false,
      type: 'danger',
      message: ''
    });

    // Dados Carregados para Edição
    const modalData = reactive({
      id_hospedes: 0,
      tipo: 'PF' as 'PF' | 'PJ',
      id_tipo: 0,
      nome_completo: '',
      rg: '',
      cpf: '',
      data_nascimento: '',
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      data_fundacao: '',
      telefone: '',
      email: ''
    });

    const isCnpjLengthValid = computed(() => {
      const clean = modalData.cnpj.replace(/[^\d]/g, '');
      return clean.length === 14;
    });

    onMounted(async () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        isDarkMode.value = true;
      } else if (savedTheme === 'light') {
        isDarkMode.value = false;
      } else {
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      toggleThemeDOM();
      await fetchHospedes();
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

    const fetchHospedes = async () => {
      try {
        let list: Hospede[] = [];

        if ((window as any).api && (window as any).api.listarHospedes) {
          list = await (window as any).api.listarHospedes();
        } else {
          // Mock data para desenvolvimento/visualização imediata
          list = [
            {
              id_hospedes: 1,
              id_hospede_pf: 101,
              id_hospede_pj: null,
              tipo: 'PF',
              nome: 'SAMUEL CARVALHO DE OLIVEIRA',
              rg: '12.345.678-9',
              cpf: '11144477735',
              data_nascimento: '1995-05-15',
              telefone: '(11) 98765-4321',
              email: 'samuel.oliveira@email.com'
            },
            {
              id_hospedes: 2,
              id_hospede_pf: null,
              id_hospede_pj: 201,
              tipo: 'PJ',
              nome: 'DEEP MIND BRASIL LTDA',
              nome_fantasia: 'GOOGLE DEEPMIND',
              razao_social: 'DEEP MIND BRASIL LTDA',
              cnpj: '00000000000191',
              data_fundacao: '2010-09-08',
              telefone: '(11) 3003-4004',
              email: 'contato@deepmind.com.br'
            },
            {
              id_hospedes: 3,
              id_hospede_pf: 102,
              id_hospede_pj: null,
              tipo: 'PF',
              nome: 'ANA JULIA PEREIRA',
              rg: '98.765.432-1',
              cpf: '22255588849',
              data_nascimento: '1998-12-25',
              telefone: '(21) 99888-7766',
              email: 'anajulia@email.com'
            }
          ];
        }
        hospedes.value = list;
      } catch (err: any) {
        triggerAlert('danger', 'Erro de Carga:', 'Não foi possível listar os hóspedes.');
      }
    };

    const filteredHospedes = computed(() => {
      return hospedes.value.filter(h => {
        if (filterType.value !== 'TODOS' && h.tipo !== filterType.value) {
          return false;
        }
        if (!searchQuery.value.trim()) return true;
        const query = searchQuery.value.toLowerCase().trim();
        const doc = h.tipo === 'PF' ? (h.cpf || '') : (h.cnpj || '');

        return (
          h.nome.toLowerCase().includes(query) ||
          doc.includes(query) ||
          (h.email || '').toLowerCase().includes(query) ||
          (h.telefone || '').includes(query)
        );
      });
    });

    const setFilterType = (type: 'TODOS' | 'PF' | 'PJ') => {
      filterType.value = type;
    };

    const formatDocument = (h: Hospede) => {
      if (h.tipo === 'PF') {
        const cpf = h.cpf || '';
        return cpf.length === 11 
          ? `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9, 11)}`
          : cpf;
      } else {
        const cnpj = h.cnpj || '';
        return cnpj.length === 14
          ? `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12, 14)}`
          : cnpj;
      }
    };

    const triggerAlert = (type: 'success' | 'danger' | 'warning', title: string, message: string) => {
      alert.type = type;
      alert.title = title;
      alert.message = message;
      alert.show = true;
    };

    const closeAlert = () => { alert.show = false; };
    const closeModalAlert = () => { modalAlert.show = false; };

    // Ações do Modal de Edição
    const openEditModal = (h: Hospede) => {
      closeAlert();
      closeModalAlert();
      
      modalData.id_hospedes = h.id_hospedes;
      modalData.tipo = h.tipo;
      modalData.id_tipo = h.tipo === 'PF' ? (h.id_hospede_pf || 0) : (h.id_hospede_pj || 0);
      modalData.nome_completo = h.nome || '';
      modalData.rg = h.rg || '';
      modalData.cpf = h.cpf || '';
      modalData.data_nascimento = h.data_nascimento || '';
      modalData.razao_social = h.razao_social || h.nome || '';
      modalData.nome_fantasia = h.nome_fantasia || '';
      modalData.cnpj = h.cnpj || '';
      modalData.data_fundacao = h.data_fundacao || '';
      modalData.telefone = h.telefone || '';
      modalData.email = h.email || '';

      if (h.tipo === 'PF') {
        maskCPF();
        maskRG();
      } else {
        maskCNPJ();
      }
      maskPhone();

      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      closeModalAlert();
    };

    // Ações do Modal de Exclusão
    const openDeleteModal = (h: Hospede) => {
      closeAlert();
      deleteGuestTarget.value = h;
      deleteConsent.value = false;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      deleteGuestTarget.value = null;
      deleteConsent.value = false;
    };

    const confirmDelete = async () => {
      if (!deleteGuestTarget.value || !deleteConsent.value) return;

      isDeleting.value = true;
      try {
        const id = deleteGuestTarget.value.id_hospedes;
        let response: { success: boolean; message: string };

        // Integração real via Electron IPC
        if ((window as any).api && (window as any).api.deletarHospede) {
          response = await (window as any).api.deletarHospede(id);
        } else {
          // Simulação no Client-Side
          console.log(`Excluindo hóspede id: ${id}`);
          await new Promise(resolve => setTimeout(resolve, 800));
          // Remove localmente do mock
          hospedes.value = hospedes.value.filter(item => item.id_hospedes !== id);
          response = { success: true, message: 'Hóspede excluído com sucesso (Simulação).' };
        }

        if (response.success) {
          triggerAlert('success', 'Excluído!', response.message);
          closeDeleteModal();
          await fetchHospedes();
        } else {
          triggerAlert('danger', 'Erro na Exclusão:', response.message);
          closeDeleteModal();
        }
      } catch (err: any) {
        triggerAlert('danger', 'Erro crítico:', err.message || 'Não foi possível excluir o hóspede.');
        closeDeleteModal();
      } finally {
        isDeleting.value = false;
      }
    };

    // Formatações e Máscaras
    const handleNameInput = (field: string, event: Event) => {
      const input = event.target as HTMLInputElement;
      let filtered = input.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
      filtered = filtered.toUpperCase();
      (modalData as any)[field] = filtered;
      input.value = filtered;
    };

    const maskCPF = () => {
      let val = modalData.cpf.replace(/[^\d]/g, '');
      if (val.length > 11) val = val.substring(0, 11);
      
      let formatted = '';
      if (val.length > 0) formatted += val.substring(0, 3);
      if (val.length > 3) formatted += '.' + val.substring(3, 6);
      if (val.length > 6) formatted += '.' + val.substring(6, 9);
      if (val.length > 9) formatted += '-' + val.substring(9, 11);
      
      modalData.cpf = formatted;
    };

    const maskCNPJ = () => {
      let val = modalData.cnpj.replace(/[^\d]/g, '');
      if (val.length > 14) val = val.substring(0, 14);
      
      let formatted = '';
      if (val.length > 0) formatted += val.substring(0, 2);
      if (val.length > 2) formatted += '.' + val.substring(2, 5);
      if (val.length > 5) formatted += '.' + val.substring(5, 8);
      if (val.length > 8) formatted += '/' + val.substring(8, 12);
      if (val.length > 12) formatted += '-' + val.substring(12, 14);
      
      modalData.cnpj = formatted;
    };

    const maskRG = () => {
      let val = modalData.rg.replace(/[^\dX]/g, '');
      if (val.length > 9) val = val.substring(0, 9);
      
      let formatted = '';
      if (val.length > 0) formatted += val.substring(0, 2);
      if (val.length > 2) formatted += '.' + val.substring(2, 5);
      if (val.length > 5) formatted += '.' + val.substring(5, 8);
      if (val.length > 8) formatted += '-' + val.substring(8, 9);
      
      modalData.rg = formatted;
    };

    const maskPhone = () => {
      let val = modalData.telefone.replace(/[^\d]/g, '');
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
      modalData.telefone = formatted;
    };

    const fetchCnpjData = async () => {
      const rawCnpj = modalData.cnpj.replace(/[^\d]/g, '');
      if (rawCnpj.length !== 14) return;

      isSearchingCnpj.value = true;
      closeModalAlert();

      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`);
        if (!response.ok) {
          throw new Error('Empresa não encontrada na base da Receita Federal.');
        }

        const data = await response.json();
        
        modalData.razao_social = (data.razao_social || '').toUpperCase();
        modalData.nome_fantasia = (data.nome_fantasia || '').toUpperCase();
        
        if (data.ddd_telefone_1) {
          modalData.telefone = data.ddd_telefone_1;
          maskPhone();
        }
        if (data.email) {
          modalData.email = data.email.toLowerCase();
        }
      } catch (err: any) {
        modalAlert.message = err.message || 'Falha ao buscar dados do CNPJ.';
        modalAlert.show = true;
      } finally {
        isSearchingCnpj.value = false;
      }
    };

    const saveChanges = async () => {
      closeModalAlert();
      isSaving.value = true;

      try {
        let payload: any = {
          id_hospedes: modalData.id_hospedes,
          tipo: modalData.tipo,
          id_tipo: modalData.id_tipo,
          telefone: modalData.telefone,
          email: modalData.email
        };

        if (modalData.tipo === 'PF') {
          if (!modalData.nome_completo || !modalData.cpf) {
            modalAlert.message = 'Nome Completo e CPF são campos obrigatórios.';
            modalAlert.show = true;
            isSaving.value = false;
            return;
          }
          payload = {
            ...payload,
            nome_completo: modalData.nome_completo,
            rg: modalData.rg,
            cpf: modalData.cpf,
            data_nascimento: modalData.data_nascimento
          };
        } else {
          if (!modalData.razao_social || !modalData.cnpj) {
            modalAlert.message = 'Razão Social e CNPJ são campos obrigatórios.';
            modalAlert.show = true;
            isSaving.value = false;
            return;
          }
          payload = {
            ...payload,
            razao_social: modalData.razao_social,
            nome_fantasia: modalData.nome_fantasia,
            cnpj: modalData.cnpj,
            data_fundacao: modalData.data_fundacao
          };
        }

        let response: { success: boolean; message: string };

        if ((window as any).api && (window as any).api.atualizarHospede) {
          response = await (window as any).api.atualizarHospede(payload);
        } else {
          console.log('Dados atualizados enviados ao backend:', payload);
          await new Promise(resolve => setTimeout(resolve, 800));
          response = { success: true, message: 'Dados do hóspede atualizados com sucesso (Simulação).' };
        }

        if (response.success) {
          triggerAlert('success', 'Sucesso!', response.message);
          closeModal();
          await fetchHospedes();
        } else {
          modalAlert.message = response.message;
          modalAlert.show = true;
        }
      } catch (err: any) {
        modalAlert.message = err.message || 'Erro crítico ao atualizar o hóspede.';
        modalAlert.show = true;
      } finally {
        isSaving.value = false;
      }
    };

    return {
      isDarkMode,
      filterType,
      searchQuery,
      hospedes,
      alert,
      showModal,
      showDeleteModal,
      isSaving,
      isDeleting,
      isSearchingCnpj,
      deleteGuestTarget,
      deleteConsent,
      modalAlert,
      modalData,
      isCnpjLengthValid,
      toggleTheme,
      setFilterType,
      filteredHospedes,
      formatDocument,
      closeAlert,
      closeModalAlert,
      openEditModal,
      closeModal,
      openDeleteModal,
      closeDeleteModal,
      confirmDelete,
      handleNameInput,
      maskCPF,
      maskCNPJ,
      maskRG,
      maskPhone,
      fetchCnpjData,
      saveChanges
    };
  }
});
</script>

<style scoped>
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

.search-group .form-control:focus, .search-group .input-group-text:focus {
  border-color: var(--bs-primary-border-subtle);
  box-shadow: none;
}

.btn-filter {
  transition: all 0.2s ease;
}

.avatar-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.table-hover tbody tr:hover {
  background-color: var(--bs-secondary-bg-subtle) !important;
}

.font-size-sm {
  font-size: 0.85rem;
}

.btn-scale {
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}

.btn-scale:active {
  transform: scale(0.98);
}
</style>
