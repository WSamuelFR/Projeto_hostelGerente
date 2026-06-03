/**
 * hostelGerente - Backend de Exclusão de Quartos
 * Caminho: src/app/quarto/deleta_quarto.ts
 */

export interface DeleteResult {
  success: boolean;
  message: string;
}

/**
 * Exclui um quarto do banco de dados SQLite de forma limpa.
 * Verifica previamente se o quarto está associado a reservas ou check-ins.
 */
export function deletarQuarto(db: any, idQuarto: number): DeleteResult {
  try {
    // 1. Verificar se o quarto existe
    const findStmt = db.prepare('SELECT numero FROM quarto WHERE id_quarto = ?');
    const room = findStmt.get(idQuarto);
    if (!room) {
      return { success: false, message: 'Quarto não encontrado.' };
    }

    // 2. Verificar associações na tabela de check-in (histórico ou ativo)
    const checkinStmt = db.prepare('SELECT id_checkin FROM checkin WHERE id_quarto = ? LIMIT 1');
    const hasCheckin = checkinStmt.get(idQuarto);
    if (hasCheckin) {
      return { 
        success: false, 
        message: 'Não é possível excluir o quarto pois ele possui histórico ou registro de check-in associado.' 
      };
    }

    // 3. Verificar associações na tabela de reservas
    const reservaStmt = db.prepare('SELECT id_reserva FROM reserva WHERE id_quarto = ? LIMIT 1');
    const hasReserva = reservaStmt.get(idQuarto);
    if (hasReserva) {
      return { 
        success: false, 
        message: 'Não é possível excluir o quarto pois ele possui reservas associadas.' 
      };
    }

    // 4. Executar exclusão
    const deleteStmt = db.prepare('DELETE FROM quarto WHERE id_quarto = ?');
    deleteStmt.run(idQuarto);

    return { 
      success: true, 
      message: `Quarto "${room.numero}" removido com sucesso!` 
    };
  } catch (error: any) {
    console.error('Erro ao excluir quarto:', error);
    return {
      success: false,
      message: `Erro interno ao excluir quarto: ${error.message || error}`
    };
  }
}
