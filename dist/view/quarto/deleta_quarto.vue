<template>
  <div v-if="show" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.65);" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow-lg border-0 rounded-4 card-glass">
        
        <!-- Header -->
        <div class="modal-header border-bottom border-secondary-subtle py-3 px-4 bg-danger-subtle text-danger">
          <h5 class="modal-title fw-bold d-flex align-items-center">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Excluir Quarto Permanentemente
          </h5>
          <button type="button" class="btn-close" @click="handleClose" aria-label="Fechar" :disabled="isDeleting"></button>
        </div>
        
        <!-- Body -->
        <div class="modal-body p-4">
          <!-- Alerta de Erro Interno do Modal -->
          <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-3" role="alert">
            <i class="bi bi-exclamation-octagon-fill me-2"></i>
            <div>{{ errorMessage }}</div>
          </div>

          <p class="text-body fs-5" v-if="room">
            Você está prestes a excluir o quarto número <strong>{{ room.numero }}</strong> ({{ room.modelo }}).
          </p>
          <p class="text-secondary small">
            Esta ação é definitiva e removerá permanentemente o quarto do banco de dados. 
            Quartos com registros de check-in ou reservas ativas não podem ser excluídos.
          </p>
          
          <!-- Confirmação de segurança -->
          <div class="form-check mt-4 p-3 border rounded border-warning bg-warning-subtle text-warning-emphasis">
            <input
              class="form-check-input ms-0 me-2"
              type="checkbox"
              id="consentCheckboxQuarto"
              v-model="deleteConsent"
              :disabled="isDeleting"
            />
            <label class="form-check-label fw-semibold cursor-pointer" for="consentCheckboxQuarto">
              Confirmo que desejo excluir este quarto permanentemente.
            </label>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="modal-footer border-top border-secondary-subtle p-3">
          <button type="button" class="btn btn-light px-4" @click="handleClose" :disabled="isDeleting">
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
            Excluir Quarto
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

interface Room {
  id_quarto: number;
  numero: string;
  modelo: string;
}

export default defineComponent({
  name: 'DeletaQuarto',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    room: {
      type: Object as () => Room | null,
      default: null
    }
  },
  emits: ['close', 'deleted'],
  setup(props, { emit }) {
    const isDeleting = ref(false);
    const deleteConsent = ref(false);
    const errorMessage = ref('');

    // Limpa o estado quando o modal abre ou fecha
    watch(() => props.show, (newVal) => {
      if (newVal) {
        deleteConsent.value = false;
        errorMessage.value = '';
      }
    });

    const handleClose = () => {
      if (isDeleting.value) return;
      emit('close');
    };

    const confirmDelete = async () => {
      if (!props.room || !deleteConsent.value) return;

      isDeleting.value = true;
      errorMessage.value = '';

      try {
        const id = props.room.id_quarto;
        let response: { success: boolean; message: string };

        if ((window as any).api && (window as any).api.deletarQuarto) {
          response = await (window as any).api.deletarQuarto(id);
        } else {
          // Simulação no Client-Side
          console.log(`Excluindo quarto id: ${id}`);
          await new Promise(resolve => setTimeout(resolve, 800));
          response = { success: true, message: 'Quarto excluído com sucesso (Simulação).' };
        }

        if (response.success) {
          emit('deleted', response.message);
        } else {
          errorMessage.value = response.message;
        }
      } catch (err: any) {
        errorMessage.value = err.message || 'Erro crítico ao excluir o quarto.';
      } finally {
        isDeleting.value = false;
      }
    };

    return {
      isDeleting,
      deleteConsent,
      errorMessage,
      handleClose,
      confirmDelete
    };
  }
});
</script>

<style scoped>
.card-glass {
  background: var(--bs-card-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--bs-border-color-translucent);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
