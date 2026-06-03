<template>
  <div class="container-fluid py-4 min-vh-100 transition-theme" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    <div class="container">
      
      <!-- Cabeçalho -->
      <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
        <h2 class="h3 mb-0 fw-bold d-flex align-items-center text-primary-emphasis">
          <i class="bi bi-box-arrow-in-right me-2 text-primary"></i>
          Gerenciamento de Check-ins
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
              placeholder="Pesquisar por hóspede ou quarto..."
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- Filtro Status -->
        <div class="col-md-6 col-lg-7 d-flex justify-content-md-end">
          <div class="btn-group shadow-sm rounded-3 overflow-hidden" role="group" aria-label="Filtro Status Checkin">
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterStatus === 'TODOS' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterStatus('TODOS')"
            >
              Todos
            </button>
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterStatus === 'ativo' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterStatus('ativo')"
            >
              Ativos
            </button>
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterStatus === 'encerrado' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterStatus('encerrado')"
            >
              Encerrados
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
                <th scope="col" class="py-3 ps-4" style="width: 35%;">Hóspede</th>
                <th scope="col" class="py-3" style="width: 12%;">Quarto</th>
                <th scope="col" class="py-3" style="width: 15%;">Entrada</th>
                <th scope="col" class="py-3" style="width: 15%;">Saída</th>
                <th scope="col" class="py-3" style="width: 10%;">Status</th>
                <th scope="col" class="py-3 text-center" style="width: 13%;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredCheckins.length === 0">
                <td colspan="6" class="text-center py-5 text-secondary">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  Nenhum registro de check-in encontrado
                </td>
              </tr>
              <tr v-else v-for="c in filteredCheckins" :key="c.id_checkin">
                <td class="py-3 ps-4">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3" :class="c.situacao === 'ativo' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'">
                      <i class="bi bi-box-arrow-in-right"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-body">
                        {{ c.nome }}
                        <span 
                          v-if="c.acompanhantes && c.acompanhantes.length > 0" 
                          class="badge bg-info-subtle text-info ms-1 small"
                          title="Possui acompanhante(s)"
                        >
                          +{{ c.acompanhantes.length }}
                        </span>
                      </div>
                      <small class="text-secondary">{{ formatDocument(c.documento) }}</small>
                    </div>
                  </div>
                </td>
                <td class="py-3">
                  <span class="fw-bold text-body">Quarto {{ c.numero_quarto }}</span>
                </td>
                <td class="py-3">
                  <span class="text-body small">{{ formatDateTime(c.data_hora_checkin) }}</span>
                </td>
                <td class="py-3">
                  <span class="text-body small" v-if="c.data_hora_checkout">{{ formatDateTime(c.data_hora_checkout) }}</span>
                  <span class="text-secondary-emphasis small" v-else>Estadia Ativa</span>
                </td>
                <td class="py-3">
                  <span :class="['badge rounded-pill px-3 py-2 fw-bold text-uppercase', c.situacao === 'ativo' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary']">
                    {{ c.situacao === 'ativo' ? 'Ativo' : 'Encerrado' }}
                  </span>
                </td>
                <td class="py-3 text-center">
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-outline-info btn-sm px-2.5 rounded-pill fw-semibold btn-scale"
                      @click="openDetailsModal(c)"
                      title="Ver Detalhes"
                    >
                      <i class="bi bi-eye"></i> Detalhes
                    </button>
                    <button
                      v-if="c.situacao === 'ativo'"
                      class="btn btn-outline-success btn-sm px-2.5 rounded-pill fw-semibold btn-scale"
                      @click="openCheckoutModal(c)"
                    >
                      <i class="bi bi-box-arrow-left me-1"></i> Checkout
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm px-2.5 rounded-pill fw-semibold btn-scale"
                      @click="openDeleteModal(c)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- MODAL DE DETALHES -->
    <div v-if="showDetailsModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.65);" role="dialog">
      <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4 card-glass">
          <div class="modal-header border-bottom border-secondary-subtle py-3 px-4">
            <h5 class="modal-title fw-bold text-primary-emphasis d-flex align-items-center">
              <i class="bi bi-info-circle me-2 text-primary"></i>
              Detalhes da Estadia
            </h5>
            <button type="button" class="btn-close" @click="closeDetailsModal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-4">
              <h6 class="fw-bold border-bottom pb-1 text-secondary-emphasis">Hóspede Principal</h6>
              <div class="p-2 bg-body-tertiary rounded-3">
                <span class="fw-bold d-block text-body">{{ selectedCheckin?.nome }}</span>
                <small class="text-secondary d-block">Doc: {{ formatDocument(selectedCheckin?.documento || '') }}</small>
                <small class="text-secondary d-block" v-if="selectedCheckin?.telefone">Tel: {{ selectedCheckin?.telefone }}</small>
                <small class="text-secondary d-block" v-if="selectedCheckin?.email">Email: {{ selectedCheckin?.email }}</small>
              </div>
            </div>

            <div class="mb-4" v-if="selectedCheckin?.acompanhantes && selectedCheckin.acompanhantes.length > 0">
              <h6 class="fw-bold border-bottom pb-1 text-secondary-emphasis">Acompanhante(s)</h6>
              <div class="d-flex flex-column gap-2">
                <div v-for="(ac, idx) in selectedCheckin.acompanhantes" :key="idx" class="p-2 bg-body-tertiary rounded-3">
                  <span class="fw-bold d-block text-body small">{{ ac.nome }}</span>
                  <small class="text-secondary d-block small">Doc: {{ formatDocument(ac.documento) }}</small>
                  <small class="text-secondary d-block small" v-if="ac.telefone">Tel: {{ ac.telefone }}</small>
                  <small class="text-secondary d-block small" v-if="ac.email">Email: {{ ac.email }}</small>
                </div>
              </div>
            </div>

            <div class="mb-2">
              <h6 class="fw-bold border-bottom pb-1 text-secondary-emphasis">Registro Geral</h6>
              <div class="row g-2 text-secondary small">
                <div class="col-6">
                  <span>Quarto: <strong class="text-body">Quarto {{ selectedCheckin?.numero_quarto }}</strong></span>
                </div>
                <div class="col-6">
                  <span>Status: <span class="badge text-uppercase" :class="selectedCheckin?.situacao === 'ativo' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">{{ selectedCheckin?.situacao }}</span></span>
                </div>
                <div class="col-12 mt-2">
                  <span>Check-in: <strong class="text-body">{{ selectedCheckin ? formatDateTime(selectedCheckin.data_hora_checkin) : '' }}</strong></span>
                </div>
                <div class="col-12" v-if="selectedCheckin?.data_hora_checkout">
                  <span>Check-out: <strong class="text-body">{{ formatDateTime(selectedCheckin.data_hora_checkout) }}</strong></span>
                </div>
                <div class="col-12 mt-2">
                  <span>Funcionário: <strong class="text-body">{{ selectedCheckin?.nome_usuario || 'Não informado' }}</strong></span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top border-secondary-subtle p-3">
            <button type="button" class="btn btn-primary px-4 fw-semibold" @click="closeDetailsModal">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE CHECK-OUT -->
    <div v-if="showCheckoutModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.65);" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4 card-glass">
          <div class="modal-header border-bottom border-secondary-subtle py-3 px-4 bg-success-subtle text-success">
            <h5 class="modal-title fw-bold d-flex align-items-center">
              <i class="bi bi-box-arrow-left me-2"></i>
              Confirmar Checkout
            </h5>
            <button type="button" class="btn-close" @click="closeCheckoutModal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-body fs-5">
              Confirmar a saída do hóspede <strong>{{ checkoutTarget?.nome }}</strong> do quarto <strong>Quarto {{ checkoutTarget?.numero_quarto }}</strong>?
            </p>
            <div class="p-3 border border-success bg-success-subtle text-success-emphasis rounded-3 small">
              <i class="bi bi-info-circle-fill me-1"></i>
              Esta ação registrará o horário de saída neste momento e definirá o status do quarto como <strong>sujo</strong> para que seja devidamente limpo antes de novo uso.
            </div>
          </div>
          <div class="modal-footer border-top border-secondary-subtle p-3">
            <button type="button" class="btn btn-light px-4" @click="closeCheckoutModal" :disabled="isProcessing">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-success px-4 fw-bold shadow-sm"
              :disabled="isProcessing"
              @click="confirmCheckout"
            >
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-check-lg me-1"></i>
              Realizar Check-out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE EXCLUSÃO -->
    <div v-if="showDeleteModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.65);" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4 card-glass">
          <div class="modal-header border-bottom border-secondary-subtle py-3 px-4 bg-danger-subtle text-danger">
            <h5 class="modal-title fw-bold d-flex align-items-center">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Excluir Registro de Check-in
            </h5>
            <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-body fs-5">
              Deseja excluir o registro de check-in de <strong>{{ deleteTarget?.nome }}</strong>?
            </p>
            <p class="text-secondary small">
              Ao deletar o check-in, todos os acompanhantes e logs relacionados a este check-in específico também serão permanentemente excluídos.
            </p>
            
            <div class="form-check mt-4 p-3 border rounded border-warning bg-warning-subtle text-warning-emphasis">
              <input
                class="form-check-input ms-0 me-2"
                type="checkbox"
                id="consentCheckbox"
                v-model="deleteConsent"
              />
              <label class="form-check-label fw-semibold cursor-pointer" for="consentCheckbox">
                Confirmo que desejo excluir permanentemente este registro.
              </label>
            </div>
          </div>
          <div class="modal-footer border-top border-secondary-subtle p-3">
            <button type="button" class="btn btn-light px-4" @click="closeDeleteModal" :disabled="isProcessing">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger px-4 fw-bold shadow-sm"
              :disabled="!deleteConsent || isProcessing"
              @click="confirmDelete"
            >
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-trash-fill me-1"></i>
              Excluir Check-in
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';

interface Acompanhante {
  id_hospedes: number;
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
}

interface Checkin {
  id_checkin: number;
  id_hospedes: number;
  id_quarto: number;
  id_usuario: number;
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
  data_hora_checkin: string;
  data_hora_checkout: string | null;
  situacao: 'ativo' | 'encerrado';
  numero_quarto?: string;
  nome_usuario?: string;
  acompanhantes?: Acompanhante[];
}

export default defineComponent({
  name: 'GerenciaCheckin',
  setup() {
    const isDarkMode = ref(false);
    const filterStatus = ref<'TODOS' | 'ativo' | 'encerrado'>('TODOS');
    const searchQuery = ref('');
    const checkins = ref<Checkin[]>([]);

    // Estados de Modais
    const showDetailsModal = ref(false);
    const showCheckoutModal = ref(false);
    const showDeleteModal = ref(false);

    const isProcessing = ref(false);
    const deleteConsent = ref(false);

    // Alvos selecionados
    const selectedCheckin = ref<Checkin | null>(null);
    const checkoutTarget = ref<Checkin | null>(null);
    const deleteTarget = ref<Checkin | null>(null);

    const alert = reactive({
      show: false,
      type: 'success',
      title: '',
      message: ''
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

      await fetchCheckins();
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

    const fetchCheckins = async () => {
      try {
        if ((window as any).api && (window as any).api.listarCheckins) {
          checkins.value = await (window as any).api.listarCheckins();
        } else {
          // Mock data para dev/visualização
          checkins.value = [
            {
              id_checkin: 1,
              id_hospedes: 1,
              id_quarto: 10,
              id_usuario: 1,
              nome: 'SAMUEL CARVALHO DE OLIVEIRA',
              documento: '11144477735',
              telefone: '(11) 98765-4321',
              email: 'samuel@email.com',
              data_hora_checkin: '2026-06-03 12:00:00',
              data_hora_checkout: null,
              situacao: 'ativo',
              numero_quarto: '101',
              nome_usuario: 'GERENTE ADMINISTRADOR',
              acompanhantes: [
                { id_hospedes: 3, nome: 'ANA JULIA PEREIRA', documento: '22255588849', telefone: '(21) 99888-7766', email: 'anajulia@email.com' }
              ]
            },
            {
              id_checkin: 2,
              id_hospedes: 2,
              id_quarto: 11,
              id_usuario: 1,
              nome: 'GOOGLE DEEPMIND BRASIL',
              documento: '00000000000191',
              telefone: '(11) 3003-4004',
              email: 'contato@deepmind.com',
              data_hora_checkin: '2026-06-01 10:00:00',
              data_hora_checkout: '2026-06-03 09:30:00',
              situacao: 'encerrado',
              numero_quarto: '102',
              nome_usuario: 'GERENTE ADMINISTRADOR',
              acompanhantes: []
            }
          ];
        }
      } catch (err) {
        console.error(err);
        triggerAlert('danger', 'Erro de Carga:', 'Não foi possível carregar os registros de check-in.');
      }
    };

    const filteredCheckins = computed(() => {
      return checkins.value.filter(c => {
        if (filterStatus.value !== 'TODOS' && c.situacao !== filterStatus.value) {
          return false;
        }
        if (!searchQuery.value.trim()) return true;
        const q = searchQuery.value.toLowerCase().trim();
        return (
          c.nome.toLowerCase().includes(q) ||
          (c.numero_quarto && c.numero_quarto.includes(q)) ||
          c.documento.includes(q)
        );
      });
    });

    const setFilterStatus = (status: 'TODOS' | 'ativo' | 'encerrado') => {
      filterStatus.value = status;
    };

    const formatDocument = (doc: string) => {
      if (doc.length === 11) {
        return `${doc.substring(0, 3)}.${doc.substring(3, 6)}.${doc.substring(6, 9)}-${doc.substring(9, 11)}`;
      } else if (doc.length === 14) {
        return `${doc.substring(0, 2)}.${doc.substring(2, 5)}.${doc.substring(5, 8)}/${doc.substring(8, 12)}-${doc.substring(12, 14)}`;
      }
      return doc;
    };

    const formatDateTime = (dtStr: string) => {
      // Recebe "YYYY-MM-DD HH:MM:SS" -> Formata "DD/MM/YYYY HH:MM"
      if (!dtStr) return '';
      const parts = dtStr.split(' ');
      if (parts.length >= 2) {
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        if (dateParts.length === 3 && timeParts.length >= 2) {
          return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${timeParts[0]}:${timeParts[1]}`;
        }
      }
      return dtStr;
    };

    // Alertas
    const triggerAlert = (type: 'success' | 'danger' | 'warning', title: string, message: string) => {
      alert.type = type;
      alert.title = title;
      alert.message = message;
      alert.show = true;
    };
    
    const closeAlert = () => { alert.show = false; };

    // Details Modal
    const openDetailsModal = (c: Checkin) => {
      selectedCheckin.value = c;
      showDetailsModal.value = true;
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedCheckin.value = null;
    };

    // Checkout Modal
    const openCheckoutModal = (c: Checkin) => {
      checkoutTarget.value = c;
      showCheckoutModal.value = true;
    };

    const closeCheckoutModal = () => {
      showCheckoutModal.value = false;
      checkoutTarget.value = null;
    };

    const confirmCheckout = async () => {
      if (!checkoutTarget.value) return;
      isProcessing.value = true;
      closeAlert();

      try {
        const id = checkoutTarget.value.id_checkin;
        let response: { success: boolean; message: string };

        if ((window as any).api && (window as any).api.encerrarCheckin) {
          response = await (window as any).api.encerrarCheckin(id);
        } else {
          console.log(`Realizando checkout do checkin ID: ${id}`);
          await new Promise(resolve => setTimeout(resolve, 800));
          // Mock update local
          const index = checkins.value.findIndex(item => item.id_checkin === id);
          if (index !== -1) {
            checkins.value[index].situacao = 'encerrado';
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            checkins.value[index].data_hora_checkout = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          }
          response = { success: true, message: 'Check-out realizado com sucesso (Mock).' };
        }

        if (response.success) {
          triggerAlert('success', 'Checkout realizado!', response.message);
          closeCheckoutModal();
          await fetchCheckins();
        } else {
          triggerAlert('danger', 'Erro no Checkout:', response.message);
          closeCheckoutModal();
        }
      } catch (err: any) {
        triggerAlert('danger', 'Erro crítico:', err.message || 'Houve uma falha ao realizar o checkout.');
        closeCheckoutModal();
      } finally {
        isProcessing.value = false;
      }
    };

    // Delete Modal
    const openDeleteModal = (c: Checkin) => {
      deleteTarget.value = c;
      deleteConsent.value = false;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      deleteTarget.value = null;
      deleteConsent.value = false;
    };

    const confirmDelete = async () => {
      if (!deleteTarget.value || !deleteConsent.value) return;
      isProcessing.value = true;
      closeAlert();

      try {
        const id = deleteTarget.value.id_checkin;
        let response: { success: boolean; message: string };

        if ((window as any).api && (window as any).api.deletarCheckin) {
          response = await (window as any).api.deletarCheckin(id);
        } else {
          console.log(`Deletando checkin ID: ${id}`);
          await new Promise(resolve => setTimeout(resolve, 800));
          checkins.value = checkins.value.filter(item => item.id_checkin !== id);
          response = { success: true, message: 'Check-in excluído com sucesso (Mock).' };
        }

        if (response.success) {
          triggerAlert('success', 'Excluído!', response.message);
          closeDeleteModal();
          await fetchCheckins();
        } else {
          triggerAlert('danger', 'Erro na Exclusão:', response.message);
          closeDeleteModal();
        }
      } catch (err: any) {
        triggerAlert('danger', 'Erro crítico:', err.message || 'Houve uma falha ao excluir o check-in.');
        closeDeleteModal();
      } finally {
        isProcessing.value = false;
      }
    };

    return {
      isDarkMode,
      filterStatus,
      searchQuery,
      filteredCheckins,
      showDetailsModal,
      showCheckoutModal,
      showDeleteModal,
      selectedCheckin,
      checkoutTarget,
      deleteTarget,
      deleteConsent,
      isProcessing,
      alert,
      toggleTheme,
      setFilterStatus,
      formatDocument,
      formatDateTime,
      closeAlert,
      openDetailsModal,
      closeDetailsModal,
      openCheckoutModal,
      closeCheckoutModal,
      confirmCheckout,
      openDeleteModal,
      closeDeleteModal,
      confirmDelete
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

.form-control:focus {
  border-color: var(--bs-primary-border-subtle);
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
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

.btn-filter {
  font-size: 0.9rem;
}

.border-dashed {
  border-style: dashed !important;
  border-width: 1px !important;
}
</style>
