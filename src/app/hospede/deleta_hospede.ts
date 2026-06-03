/**
 * hostelGerente - Backend de Exclusão de Hóspedes
 * Caminho: src/app/hospede/deleta_hospede.ts
 */

export interface DeleteResult {
  success: boolean;
  message: string;
}

/**
 * Exclui um hóspede do banco de dados SQLite de forma limpa.
 * Remove os registros relacionados em hospede_cpf ou hospede_pj e na tabela pivô hospedes.
 */
export function deletarHospede(db: any, idHospedes: number): DeleteResult {
  try {
    // 1. Buscar os IDs de PF/PJ associados ao hóspede
    const findStmt = db.prepare(`
      SELECT id_hospede_pf, id_hospede_pj 
      FROM hospedes 
      WHERE id_hospedes = ?
    `);
    
    const hospede = findStmt.get(idHospedes);
    
    if (!hospede) {
      return { success: false, message: 'Hóspede não encontrado.' };
    }

    const { id_hospede_pf, id_hospede_pj } = hospede;

    // 2. Iniciar transação no SQLite
    db.exec('BEGIN TRANSACTION;');

    try {
      // Deletar da tabela específica (PF) se aplicável
      if (id_hospede_pf !== null) {
        const deletePF = db.prepare('DELETE FROM hospede_cpf WHERE id_hospede_pf = ?');
        deletePF.run(id_hospede_pf);
      }

      // Deletar da tabela específica (PJ) se aplicável
      if (id_hospede_pj !== null) {
        const deletePJ = db.prepare('DELETE FROM hospede_pj WHERE id_hospede_pj = ?');
        deletePJ.run(id_hospede_pj);
      }

      // Deletar da tabela pivô hospedes (por segurança, caso não tenha cascateado)
      const deleteHospedes = db.prepare('DELETE FROM hospedes WHERE id_hospedes = ?');
      deleteHospedes.run(idHospedes);

      db.exec('COMMIT;');
      
      return { success: true, message: 'Hóspede removido com sucesso!' };
    } catch (err: any) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    console.error('Erro ao excluir hóspede:', error);
    return {
      success: false,
      message: `Erro interno ao excluir hóspede: ${error.message || error}`
    };
  }
}
