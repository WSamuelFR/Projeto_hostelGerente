<template>
  <div class="container-fluid py-4 min-vh-100 transition-theme" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    <div class="container">
      
      <!-- Cabeçalho -->
      <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
        <h2 class="h3 mb-0 fw-bold d-flex align-items-center text-primary-emphasis">
          <i class="bi bi-grid-fill me-2"></i>
          Gerenciamento de Quartos
        </h2>
        <div class="form-check form-switch d-flex align-items-center">
          <i class="bi bi-sun-fill me-2 text-warning" v-if="!isDarkMode"></i>
          <i class="bi bi-moon-stars-fill me-2 text-primary" v-else></i>
          <input
            class="form-check-input theme-toggle-switch cursor-pointer"
            type="checkbox"
            role="switch"
            id="managementThemeToggle"
            v-model="isDarkMode"
            @change="toggleTheme"
          />
        </div>
      </div>

      <!-- Alertas de Feedback da Tela -->
      <div v-if="alert.show" :class="['alert alert-dismissible fade show', `alert-${alert.type}`]" role="alert">
        <i :class="['bi me-2', alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill']"></i>
        <strong>{{ alert.title }}</strong> {{ alert.message }}
        <button type="button" class="btn-close" @click="closeAlert" aria-label="Close"></button>
      </div>

      <!-- Filtros e Barra de Pesquisa -->
      <div class="card shadow-sm border-0 rounded-4 mb-4 card-glass">
        <div class="card-body p-3">
          <div class="row g-2 align-items-center">
            
            <!-- Barra de Pesquisa -->
            <div class="col-lg-4 col-md-6">
              <div class="input-group search-group">
                <span class="input-group-text bg-body text-secondary border-end-0"><i class="bi bi-search"></i></span>
                <input
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="Pesquisar por número ou capacidade..."
                  v-model="searchQuery"
                />
              </div>
            </div>

            <!-- Filtro de Modelo -->
            <div class="col-lg-3 col-md-6">
              <div class="d-flex gap-1 bg-body-secondary p-1 rounded-3 border border-secondary-subtle">
                <button
                  type="button"
                  class="btn btn-sm btn-filter flex-grow-1 fw-semibold text-uppercase"
                  :class="filterModel === 'TODOS' ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'"
                  @click="setFilterModel('TODOS')"
                >
                  Todos
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-filter flex-grow-1 fw-semibold text-uppercase"
                  :class="filterModel === 'simples' ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'"
                  @click="setFilterModel('simples')"
                >
                  Simples
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-filter flex-grow-1 fw-semibold text-uppercase"
                  :class="filterModel === 'suíte' ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'"
                  @click="setFilterModel('suíte')"
                >
                  Suíte
                </button>
              </div>
            </div>

            <!-- Filtro de Situação -->
            <div class="col-lg-3 col-md-6">
              <select class="form-select" v-model="filterSituation">
                <option value="TODAS">Todas as Situações</option>
                <option value="limpo">Limpo</option>
                <option value="sujo">Sujo</option>
                <option value="manutenção">Manutenção</option>
              </select>
            </div>

            <!-- Botão Atualizar Lista -->
            <div class="col-lg-2 col-md-6 text-end">
              <button class="btn btn-outline-secondary w-100 fw-semibold" @click="fetchQuartos">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Atualizar
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Tabela de Quartos -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden card-glass">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase font-size-sm">
              <tr>
                <th scope="col" class="ps-4 py-3">Número</th>
                <th scope="col" class="py-3">Modelo</th>
                <th scope="col" class="py-3">Capacidade</th>
                <th scope="col" class="py-3">Situação</th>
                <th scope="col" class="pe-4 py-3 text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredQuartos.length === 0">
                <td colspan="5" class="text-center py-5 text-secondary">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Nenhum quarto encontrado com os filtros selecionados.
                </td>
              </tr>
              <tr v-for="q in filteredQuartos" :key="q.id_quarto">
                <td class="ps-4 py-3 fw-bold text-primary-emphasis">
                  Quarto {{ q.numero }}
                </td>
                <td class="py-3 text-capitalize">
                  {{ q.modelo }}
                </td>
                <td class="py-3">
                  <i class="bi bi-people me-1 text-secondary"></i>
                  {{ q.capacidade }} {{ q.capacidade === 1 ? 'hóspede' : 'hóspedes' }}
                </td>
                <td class="py-3">
                  <span :class="['badge px-3 py-2 rounded-pill fw-semibold text-uppercase font-size-sm', getSituationBadgeClass(q.situacao)]">
                    {{ q.situacao }}
                  </span>
                </td>
                <td class="pe-4 py-3 text-end">
                  <div class="btn-group gap-1">
                    <button class="btn btn-sm btn-outline-primary rounded-3 btn-scale" @click="openEditModal(q)" title="Editar Quarto">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-3 btn-scale" @click="openDeleteModal(q)" title="Excluir Quarto">
                      <i class="bi bi-trash-fill"></i>
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4 card-glass">
          
          <div class="modal-header border-bottom border-secondary-subtle py-3 px-4">
            <h5 class="modal-title fw-bold text-primary-emphasis">
              <i class="bi bi-pencil-square me-2"></i>
              Editar Quarto
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Fechar"></button>
          </div>
          
          <div class="modal-body p-4">
            <!-- Alertas no Modal -->
            <div v-if="modalAlert.show" class="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <i class="bi bi-exclamation-octagon-fill me-2"></i>
              <div>{{ modalAlert.message }}</div>
            </div>

            <form @submit.prevent="saveChanges" novalidate>
              <div class="row g-3">
                <!-- Número -->
                <div class="col-md-12">
                  <label for="modalNumero" class="form-label fw-semibold">Número do Quarto <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-hash text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0 text-uppercase"
                      id="modalNumero"
                      v-model="modalData.numero"
                      @input="handleNumeroInput"
                      required
                    />
                  </div>
                </div>

                <!-- Modelo -->
                <div class="col-md-12">
                  <label for="modalModelo" class="form-label fw-semibold">Modelo <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-tag text-secondary"></i></span>
                    <select
                      class="form-select border-start-0 ps-0"
                      id="modalModelo"
                      v-model="modalData.modelo"
                      required
                    >
                      <option value="simples">Simples</option>
                      <option value="suíte">Suíte</option>
                    </select>
                  </div>
                </div>

                <!-- Capacidade -->
                <div class="col-md-6">
                  <label for="modalCapacidade" class="form-label fw-semibold">Capacidade <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-people text-secondary"></i></span>
                    <input
                      type="number"
                      class="form-control border-start-0 ps-0"
                      id="modalCapacidade"
                      min="1"
                      v-model="modalData.capacidade"
                      required
                    />
                  </div>
                </div>

                <!-- Situação -->
                <div class="col-md-6">
                  <label for="modalSituacao" class="form-label fw-semibold">Situação <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-info-circle text-secondary"></i></span>
                    <select
                      class="form-select border-start-0 ps-0"
                      id="modalSituacao"
                      v-model="modalData.situacao"
                      required
                    >
                      <option value="limpo">Limpo</option>
                      <option value="sujo">Sujo</option>
                      <option value="manutenção">Manutenção</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Footer do Modal -->
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

    <!-- MODAL DE EXCLUSÃO (DELETA_QUARTO) -->
    <DeletaQuarto
      :show="showDeleteModal"
      :room="deleteRoomTarget"
      @close="closeDeleteModal"
      @deleted="onRoomDeleted"
    />

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import DeletaQuarto from './deleta_quarto.vue';

interface Quarto {
  id_quarto: number;
  numero: string;
  modelo: 'simples' | 'suíte';
  capacidade: number;
  situacao: 'limpo' | 'sujo' | 'manutenção';
}

export default defineComponent({
  name: 'GerenciaQuarto',
  components: {
    DeletaQuarto
  },
  setup() {
    const isDarkMode = ref(false);
    const searchQuery = ref('');
    const filterModel = ref<'TODOS' | 'simples' | 'suíte'>('TODOS');
    const filterSituation = ref<string>('TODOS');

    // Estado da Tabela
    const quartos = ref<Quarto[]>([]);

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

    // Alvo de Exclusão
    const deleteRoomTarget = ref<Quarto | null>(null);

    // Controles de Alerta do Modal de Edição
    const modalAlert = reactive({
      show: false,
      message: ''
    });

    // Dados Carregados para Edição
    const modalData = reactive({
      id_quarto: 0,
      numero: '',
      modelo: 'simples' as 'simples' | 'suíte',
      capacidade: 1,
      situacao: 'limpo' as 'limpo' | 'sujo' | 'manutenção'
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
      await fetchQuartos();
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

    const fetchQuartos = async () => {
      try {
        let list: Quarto[] = [];

        if ((window as any).api && (window as any).api.listarQuartos) {
          list = await (window as any).api.listarQuartos();
        } else {
          // Mock data para desenvolvimento/visualização imediata fora do Electron
          list = [
            { id_quarto: 1, numero: '101', modelo: 'simples', capacidade: 2, situacao: 'limpo' },
            { id_quarto: 2, numero: '102', modelo: 'suíte', capacidade: 4, situacao: 'sujo' },
            { id_quarto: 3, numero: '201', modelo: 'suíte', capacidade: 3, situacao: 'manutenção' },
            { id_quarto: 4, numero: '202', modelo: 'simples', capacidade: 1, situacao: 'limpo' }
          ];
        }
        quartos.value = list;
      } catch (err: any) {
        triggerAlert('danger', 'Erro de Carga:', 'Não foi possível listar os quartos.');
      }
    };

    const filteredQuartos = computed(() => {
      return quartos.value.filter(q => {
        // Filtro de Modelo
        if (filterModel.value !== 'TODOS' && q.modelo !== filterModel.value) {
          return false;
        }

        // Filtro de Situação
        if (filterSituation.value !== 'TODOS' && q.situacao !== filterSituation.value) {
          return false;
        }

        // Filtro de Busca por texto
        if (!searchQuery.value.trim()) return true;
        const query = searchQuery.value.toLowerCase().trim();

        return (
          q.numero.toLowerCase().includes(query) ||
          q.capacidade.toString().includes(query) ||
          q.situacao.toLowerCase().includes(query) ||
          q.modelo.toLowerCase().includes(query)
        );
      });
    });

    const setFilterModel = (model: 'TODOS' | 'simples' | 'suíte') => {
      filterModel.value = model;
    };

    const getSituationBadgeClass = (situacao: string) => {
      switch (situacao) {
        case 'limpo': return 'bg-success-subtle text-success border border-success-subtle';
        case 'sujo': return 'bg-danger-subtle text-danger border border-danger-subtle';
        case 'manutenção': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
        default: return 'bg-secondary-subtle text-secondary';
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

    // Edição de Quarto
    const openEditModal = (q: Quarto) => {
      closeAlert();
      closeModalAlert();

      modalData.id_quarto = q.id_quarto;
      modalData.numero = q.numero;
      modalData.modelo = q.modelo;
      modalData.capacidade = q.capacidade;
      modalData.situacao = q.situacao;

      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      closeModalAlert();
    };

    const handleNumeroInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      let filtered = input.value.replace(/[^a-zA-Z0-9]/g, '');
      filtered = filtered.toUpperCase();
      modalData.numero = filtered;
      input.value = filtered;
    };

    const saveChanges = async () => {
      closeModalAlert();

      if (!modalData.numero) {
        modalAlert.message = 'O número do quarto é obrigatório.';
        modalAlert.show = true;
        return;
      }

      if (modalData.capacidade < 1) {
        modalAlert.message = 'A capacidade deve ser no mínimo 1 hóspede.';
        modalAlert.show = true;
        return;
      }

      isSaving.value = true;

      try {
        let response: { success: boolean; message: string };

        if ((window as any).api && (window as any).api.atualizarQuarto) {
          response = await (window as any).api.atualizarQuarto({
            id_quarto: modalData.id_quarto,
            numero: modalData.numero,
            modelo: modalData.modelo,
            capacidade: modalData.capacidade,
            situacao: modalData.situacao
          });
        } else {
          // Simulação no Client-Side
          console.log('Dados atualizados enviados ao backend:', modalData);
          await new Promise(resolve => setTimeout(resolve, 800));
          response = { success: true, message: 'Quarto atualizado com sucesso (Simulação).' };
        }

        if (response.success) {
          triggerAlert('success', 'Sucesso!', response.message);
          closeModal();
          await fetchQuartos();
        } else {
          modalAlert.message = response.message;
          modalAlert.show = true;
        }
      } catch (err: any) {
        modalAlert.message = err.message || 'Erro crítico ao atualizar o quarto.';
        modalAlert.show = true;
      } finally {
        isSaving.value = false;
      }
    };

    // Exclusão de Quarto
    const openDeleteModal = (q: Quarto) => {
      closeAlert();
      deleteRoomTarget.value = {
        id_quarto: q.id_quarto,
        numero: q.numero,
        modelo: q.modelo
      };
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      deleteRoomTarget.value = null;
    };

    const onRoomDeleted = async (message: string) => {
      triggerAlert('success', 'Excluído!', message);
      closeDeleteModal();
      await fetchQuartos();
    };

    return {
      isDarkMode,
      searchQuery,
      filterModel,
      filterSituation,
      quartos,
      alert,
      showModal,
      showDeleteModal,
      isSaving,
      deleteRoomTarget,
      modalAlert,
      modalData,
      toggleTheme,
      filteredQuartos,
      setFilterModel,
      getSituationBadgeClass,
      closeAlert,
      closeModalAlert,
      openEditModal,
      closeModal,
      handleNumeroInput,
      saveChanges,
      openDeleteModal,
      closeDeleteModal,
      onRoomDeleted,
      fetchQuartos
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
