/**
 * hostelGerente - Backend de Exclusão de Usuários
 * Caminho: src/app/usuario/deleta_usuario.ts
 */

export interface DeleteResult {
  success: boolean;
  message: string;
}

/**
 * Exclui um funcionário/usuário do banco de dados SQLite.
 * Como as tabelas login e nivel_acesso foram criadas com ON DELETE CASCADE referenciando usuario,
 * a remoção do registro principal na tabela usuario apagará automaticamente as credenciais associadas.
 */
export function deletarUsuario(db: any, idUsuario: number): DeleteResult {
  try {
    const deleteStmt = db.prepare('DELETE FROM usuario WHERE id_usuario = ?');
    const result = deleteStmt.run(idUsuario);

    if (result.changes === 0) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    return { success: true, message: 'Funcionário excluído com sucesso!' };
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    return {
      success: false,
      message: `Erro interno ao excluir funcionário: ${error.message || error}`
    };
  }
}
