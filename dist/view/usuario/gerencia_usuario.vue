<template>
  <div class="container-fluid py-4 min-vh-100 transition-theme" :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    <div class="container">
      
      <!-- Cabeçalho -->
      <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
        <h2 class="h3 mb-0 fw-bold d-flex align-items-center text-primary-emphasis">
          <i class="bi bi-people-fill me-2"></i>
          Gerenciamento de Funcionários
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
              placeholder="Pesquisar por nome, username ou email..."
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- Filtros Rápidos de Nível -->
        <div class="col-md-6 col-lg-7 d-flex justify-content-md-end">
          <div class="btn-group shadow-sm rounded-3 overflow-hidden" role="group" aria-label="Filtro Nível Acesso">
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterLevel === 'TODOS' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterLevel('TODOS')"
            >
              Todos
            </button>
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterLevel === 'admin' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterLevel('admin')"
            >
              Administrador
            </button>
            <button
              type="button"
              class="btn py-2 px-3 fw-semibold text-uppercase btn-filter"
              :class="filterLevel === 'padrao' ? 'btn-primary' : 'btn-outline-secondary border-secondary-subtle'"
              @click="setFilterLevel('padrao')"
            >
              Padrão
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
                <th scope="col" class="py-3 ps-4" style="width: 40%;">Nome</th>
                <th scope="col" class="py-3" style="width: 15%;">Username</th>
                <th scope="col" class="py-3" style="width: 15%;">Permissão</th>
                <th scope="col" class="py-3" style="width: 15%;">Contato</th>
                <th scope="col" class="py-3 text-center" style="width: 15%;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsuarios.length === 0">
                <td colspan="5" class="text-center py-5 text-secondary">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  Nenhum funcionário encontrado
                </td>
              </tr>
              <tr v-else v-for="u in filteredUsuarios" :key="u.id_usuario">
                <td class="py-3 ps-4">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3" :class="u.nivel === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'">
                      <i class="bi bi-person-badge"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-body">{{ u.nome_completo }}</div>
                      <small class="text-secondary">CPF: {{ formatCPFString(u.cpf) }}</small>
                    </div>
                  </div>
                </td>
                <td class="py-3 fw-semibold text-secondary-emphasis">
                  {{ u.nome_usuario || '-' }}
                </td>
                <td class="py-3">
                  <span :class="['badge rounded-pill px-3 py-2 fw-bold text-uppercase', u.nivel === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary']">
                    {{ u.nivel === 'admin' ? 'Admin' : 'Padrão' }}
                  </span>
                </td>
                <td class="py-3">
                  <div class="d-flex flex-column">
                    <span v-if="u.telefone" class="text-body"><i class="bi bi-telephone-fill me-1 text-secondary"></i> {{ u.telefone }}</span>
                    <span v-if="u.email" class="text-secondary small"><i class="bi bi-envelope-fill me-1 text-secondary"></i> {{ u.email }}</span>
                    <span v-if="!u.telefone && !u.email" class="text-secondary-emphasis small">-</span>
                  </div>
                </td>
                <td class="py-3 text-center">
                  <div class="d-flex justify-content-center gap-2">
                    <button
                      class="btn btn-outline-primary btn-sm px-3 rounded-pill fw-semibold btn-scale"
                      @click="openEditModal(u)"
                    >
                      <i class="bi bi-pencil-square me-1"></i> Editar
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm px-3 rounded-pill fw-semibold btn-scale"
                      @click="openDeleteModal(u)"
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
              Alterar Cadastro de Funcionário
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
              <div class="row g-3">
                
                <!-- DADOS PESSOAIS -->
                <div class="col-12"><h6 class="fw-bold text-primary border-bottom pb-2 mb-3">Dados Pessoais</h6></div>

                <!-- Nome Completo -->
                <div class="col-md-12">
                  <label for="modalNomeCompleto" class="form-label fw-semibold">Nome Completo <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-person text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0"
                      id="modalNomeCompleto"
                      v-model="modalData.nome_completo"
                      @input="handleNameInput"
                      required
                    />
                  </div>
                </div>

                <!-- CPF -->
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

                <!-- RG -->
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

                <!-- Data de Nascimento -->
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

                <!-- Telefone -->
                <div class="col-md-4">
                  <label for="modalTelefone" class="form-label fw-semibold">Telefone</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-telephone text-secondary"></i></span>
                    <input
                      type="tel"
                      class="form-control border-start-0 ps-0"
                      id="modalTelefone"
                      v-model="modalData.telefone"
                      @input="maskPhone"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div class="col-md-4">
                  <label for="modalEmail" class="form-label fw-semibold">Email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-envelope text-secondary"></i></span>
                    <input
                      type="email"
                      class="form-control border-start-0 ps-0"
                      id="modalEmail"
                      v-model="modalData.email"
                    />
                  </div>
                </div>

                <!-- DADOS DE ACESSO -->
                <div class="col-12 mt-4"><h6 class="fw-bold text-primary border-bottom pb-2 mb-3">Acesso e Credenciais</h6></div>

                <!-- Username -->
                <div class="col-md-6">
                  <label for="modalNomeUsuario" class="form-label fw-semibold">Nome de Usuário (Username) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-person-workspace text-secondary"></i></span>
                    <input
                      type="text"
                      class="form-control border-start-0 ps-0 text-uppercase"
                      id="modalNomeUsuario"
                      v-model="modalData.nome_usuario"
                      @input="handleUsernameInput"
                      required
                    />
                  </div>
                </div>

                <!-- Nível -->
                <div class="col-md-6">
                  <label for="modalNivel" class="form-label fw-semibold">Nível de Acesso <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-shield-lock text-secondary"></i></span>
                    <select class="form-select border-start-0 ps-0" id="modalNivel" v-model="modalData.nivel" required>
                      <option value="padrao">PADRÃO</option>
                      <option value="admin">ADMINISTRADOR</option>
                    </select>
                  </div>
                </div>

                <!-- Nova Senha (Opcional) -->
                <div class="col-md-6">
                  <label for="modalSenha" class="form-label fw-semibold">Nova Senha (Deixe em branco para não alterar)</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-key text-secondary"></i></span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control border-start-0 border-end-0 ps-0"
                      id="modalSenha"
                      placeholder="Mínimo 6 caracteres"
                      v-model="modalData.senha"
                    />
                    <button class="btn btn-outline-secondary border-start-0" type="button" @click="showPassword = !showPassword">
                      <i :class="['bi', showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill']"></i>
                    </button>
                  </div>
                </div>

                <!-- Repita a Senha -->
                <div class="col-md-6">
                  <label for="modalConfirmarSenha" class="form-label fw-semibold">Repita a Nova Senha</label>
                  <div class="input-group">
                    <span class="input-group-text bg-body border-end-0"><i class="bi bi-key-fill text-secondary"></i></span>
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-control border-start-0 border-end-0 ps-0"
                      id="modalConfirmarSenha"
                      placeholder="Repita a senha"
                      v-model="modalData.confirmar_senha"
                    />
                    <button class="btn btn-outline-secondary border-start-0" type="button" @click="showConfirmPassword = !showConfirmPassword">
                      <i :class="['bi', showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill']"></i>
                    </button>
                  </div>
                </div>

              </div>

              <!-- Rodapé modal -->
              <div class="d-flex justify-content-end gap-2 mt-5 pt-3 border-top border-secondary-subtle">
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
              Excluir Funcionário Permanentemente
            </h5>
            <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Fechar"></button>
          </div>
          
          <div class="modal-body p-4">
            <p class="text-body fs-5">
              Você está prestes a excluir o funcionário <strong>{{ deleteUserTarget?.nome_completo }}</strong>.
            </p>
            <p class="text-secondary small">
              Esta ação é definitiva e removerá permanentemente o cadastro do funcionário, suas credenciais de login e todas as suas permissões no sistema.
            </p>
            
            <div class="form-check mt-4 p-3 border rounded border-warning bg-warning-subtle text-warning-emphasis">
              <input
                class="form-check-input ms-0 me-2"
                type="checkbox"
                id="consentCheckbox"
                v-model="deleteConsent"
              />
              <label class="form-check-label fw-semibold cursor-pointer" for="consentCheckbox">
                Confirmo que desejo excluir permanentemente este funcionário e todas as suas permissões de login.
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
              Excluir Funcionário
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';

interface Usuario {
  id_usuario: number;
  nome_completo: string;
  rg: string | null;
  cpf: string;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  id_login: number | null;
  nome_usuario: string | null;
  nivel: 'admin' | 'padrao' | null;
}

export default defineComponent({
  name: 'GerenciaUsuario',
  setup() {
    const isDarkMode = ref(false);
    const filterLevel = ref<'TODOS' | 'admin' | 'padrao'>('TODOS');
    const searchQuery = ref('');

    // Estado da Tabela
    const usuarios = ref<Usuario[]>([]);

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

    // Senha Visual no Modal
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    // Controles de Exclusão
    const deleteUserTarget = ref<Usuario | null>(null);
    const deleteConsent = ref(false);

    // Controles de Alerta do Modal de Edição
    const modalAlert = reactive({
      show: false,
      type: 'danger',
      message: ''
    });

    // Dados Carregados para Edição
    const modalData = reactive({
      id_usuario: 0,
      id_login: 0,
      nome_completo: '',
      rg: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      email: '',
      nome_usuario: '',
      senha: '',
      confirmar_senha: '',
      nivel: 'padrao' as 'admin' | 'padrao'
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
      await fetchUsuarios();
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

    const fetchUsuarios = async () => {
      try {
        let list: Usuario[] = [];

        // Conexão com o backend real do electron
        if ((window as any).api && (window as any).api.listarUsuarios) {
          list = await (window as any).api.listarUsuarios();
        } else {
          // Mock data para desenvolvimento/visualização rica imediata
          list = [
            {
              id_usuario: 1,
              nome_completo: 'SAMUEL CARVALHO DE OLIVEIRA',
              rg: '12.345.678-9',
              cpf: '11144477735',
              data_nascimento: '1995-05-15',
              telefone: '(11) 98765-4321',
              email: 'samuel.oliveira@email.com',
              id_login: 501,
              nome_usuario: 'SAMUEL.OLIVEIRA',
              nivel: 'admin'
            },
            {
              id_usuario: 2,
              nome_completo: 'BEATRIZ SANTOS SOUZA',
              rg: '98.765.432-1',
              cpf: '22255588849',
              data_nascimento: '1997-10-20',
              telefone: '(21) 99999-8888',
              email: 'beatriz.souza@email.com',
              id_login: 502,
              nome_usuario: 'BEA.SOUZA',
              nivel: 'padrao'
            }
          ];
        }
        usuarios.value = list;
      } catch (err: any) {
        triggerAlert('danger', 'Erro de Carga:', 'Não foi possível listar os funcionários.');
      }
    };

    // Filtros reativos (Pesquisa e Permissão)
    const filteredUsuarios = computed(() => {
      return usuarios.value.filter(u => {
        if (filterLevel.value !== 'TODOS' && u.nivel !== filterLevel.value) {
          return false;
        }
        if (!searchQuery.value.trim()) return true;
        const query = searchQuery.value.toLowerCase().trim();

        return (
          u.nome_completo.toLowerCase().includes(query) ||
          (u.nome_usuario || '').toLowerCase().includes(query) ||
          (u.email || '').toLowerCase().includes(query) ||
          (u.cpf || '').includes(query)
        );
      });
    });

    const setFilterLevel = (level: 'TODOS' | 'admin' | 'padrao') => {
      filterLevel.value = level;
    };

    const formatCPFString = (cpf: string) => {
      const clean = cpf.replace(/[^\d]/g, '');
      return clean.length === 11 
        ? `${clean.substring(0, 3)}.${clean.substring(3, 6)}.${clean.substring(6, 9)}-${clean.substring(9, 11)}`
        : cpf;
    };

    const triggerAlert = (type: 'success' | 'danger' | 'warning', title: string, message: string) => {
      alert.type = type;
      alert.title = title;
      alert.message = message;
      alert.show = true;
    };

    const closeAlert = () => { alert.show = false; };
    const closeModalAlert = () => { modalAlert.show = false; };

    // Edição do Usuário
    const openEditModal = (u: Usuario) => {
      closeAlert();
      closeModalAlert();
      
      modalData.id_usuario = u.id_usuario;
      modalData.id_login = u.id_login || 0;
      modalData.nome_completo = u.nome_completo || '';
      modalData.rg = u.rg || '';
      modalData.cpf = u.cpf || '';
      modalData.data_nascimento = u.data_nascimento || '';
      modalData.telefone = u.telefone || '';
      modalData.email = u.email || '';
      modalData.nome_usuario = u.nome_usuario || '';
      modalData.nivel = u.nivel || 'padrao';
      modalData.senha = '';
      modalData.confirmar_senha = '';

      // Aplicar máscaras
      maskCPF();
      maskRG();
      maskPhone();

      showPassword.value = false;
      showConfirmPassword.value = false;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      closeModalAlert();
    };

    // Exclusão do Usuário
    const openDeleteModal = (u: Usuario) => {
      closeAlert();
      deleteUserTarget.value = u;
      deleteConsent.value = false;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      deleteUserTarget.value = null;
      deleteConsent.value = false;
    };

    const confirmDelete = async () => {
      if (!deleteUserTarget.value || !deleteConsent.value) return;

      isDeleting.value = true;
      try {
        const id = deleteUserTarget.value.id_usuario;
        let response: { success: boolean; message: string };

        if ((window as any).api && (window as any).api.deletarUsuario) {
          response = await (window as any).api.deletarUsuario(id);
        } else {
          console.log(`Excluindo usuário id: ${id}`);
          await new Promise(resolve => setTimeout(resolve, 800));
          // Remove localmente do mock
          usuarios.value = usuarios.value.filter(item => item.id_usuario !== id);
          response = { success: true, message: 'Funcionário excluído com sucesso (Simulação).' };
        }

        if (response.success) {
          triggerAlert('success', 'Excluído!', response.message);
          closeDeleteModal();
          await fetchUsuarios();
        } else {
          triggerAlert('danger', 'Erro na Exclusão:', response.message);
          closeDeleteModal();
        }
      } catch (err: any) {
        triggerAlert('danger', 'Erro crítico:', err.message || 'Não foi possível excluir o funcionário.');
        closeDeleteModal();
      } finally {
        isDeleting.value = false;
      }
    };

    // Filtros e Máscaras
    const handleNameInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      let filtered = input.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
      filtered = filtered.toUpperCase();
      modalData.nome_completo = filtered;
      input.value = filtered;
    };

    const handleUsernameInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      let filtered = input.value.replace(/[^a-zA-Z0-9._]/g, '');
      filtered = filtered.toUpperCase();
      modalData.nome_usuario = filtered;
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

    // Gravar Alterações
    const saveChanges = async () => {
      closeModalAlert();
      isSaving.value = true;

      // 1. Validações
      if (!modalData.nome_completo || !modalData.cpf || !modalData.nome_usuario) {
        modalAlert.message = 'Nome Completo, CPF e Nome de Usuário são campos obrigatórios.';
        modalAlert.show = true;
        isSaving.value = false;
        return;
      }

      // Validação de senha se informada
      if (modalData.senha && modalData.senha.trim() !== '') {
        if (modalData.senha.length < 6) {
          modalAlert.message = 'A nova senha deve conter no mínimo 6 caracteres.';
          modalAlert.show = true;
          isSaving.value = false;
          return;
        }
        if (modalData.senha !== modalData.confirmar_senha) {
          modalAlert.message = 'As novas senhas digitadas não coincidem.';
          modalAlert.show = true;
          isSaving.value = false;
          return;
        }
      }

      try {
        const payload = {
          id_usuario: modalData.id_usuario,
          id_login: modalData.id_login,
          nome_completo: modalData.nome_completo,
          rg: modalData.rg,
          cpf: modalData.cpf,
          data_nascimento: modalData.data_nascimento,
          telefone: modalData.telefone,
          email: modalData.email,
          nome_usuario: modalData.nome_usuario,
          senha: modalData.senha || undefined,
          nivel: modalData.nivel
        };

        let response: { success: boolean; message: string };

        if ((window as any).api && (window as any).api.atualizarUsuario) {
          response = await (window as any).api.atualizarUsuario(payload);
        } else {
          console.log('Dados de atualização enviados ao backend:', payload);
          await new Promise(resolve => setTimeout(resolve, 800));
          response = { success: true, message: 'Dados do funcionário atualizados com sucesso (Simulação).' };
        }

        if (response.success) {
          triggerAlert('success', 'Sucesso!', response.message);
          closeModal();
          await fetchUsuarios();
        } else {
          modalAlert.message = response.message;
          modalAlert.show = true;
        }
      } catch (err: any) {
        modalAlert.message = err.message || 'Erro crítico ao atualizar o funcionário.';
        modalAlert.show = true;
      } finally {
        isSaving.value = false;
      }
    };

    return {
      isDarkMode,
      filterLevel,
      searchQuery,
      usuarios,
      alert,
      showModal,
      showDeleteModal,
      isSaving,
      isDeleting,
      showPassword,
      showConfirmPassword,
      deleteUserTarget,
      deleteConsent,
      modalAlert,
      modalData,
      toggleTheme,
      setFilterLevel,
      filteredUsuarios,
      formatCPFString,
      closeAlert,
      closeModalAlert,
      openEditModal,
      closeModal,
      openDeleteModal,
      closeDeleteModal,
      confirmDelete,
      handleNameInput,
      handleUsernameInput,
      maskCPF,
      maskRG,
      maskPhone,
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
