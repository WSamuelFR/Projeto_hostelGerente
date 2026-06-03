/**
 * hostelGerente - Backend de Gerenciamento e Atualização de Quartos
 * Caminho: src/app/quarto/update_quarto.ts
 */

export interface Quarto {
  id_quarto: number;
  numero: string;
  modelo: 'simples' | 'suíte';
  capacidade: number;
  situacao: 'limpo' | 'sujo' | 'manutenção';
}

export interface UpdateQuartoInput {
  id_quarto: number;
  numero: string;
  modelo: 'simples' | 'suíte';
  capacidade: number;
  situacao: 'limpo' | 'sujo' | 'manutenção';
}

export interface UpdateResult {
  success: boolean;
  message: string;
}

/**
 * Retorna todos os quartos cadastrados no banco de dados, ordenados por número.
 */
export function listarQuartos(db: any): Quarto[] {
  try {
    const stmt = db.prepare('SELECT id_quarto, numero, modelo, capacidade, situacao FROM quarto ORDER BY numero ASC');
    return stmt.all ? stmt.all() : (stmt.allObjects ? stmt.allObjects() : []);
  } catch (error) {
    console.error('Erro ao listar quartos:', error);
    return [];
  }
}

/**
 * Atualiza as informações de um quarto.
 */
export function atualizarQuarto(db: any, input: UpdateQuartoInput): UpdateResult {
  try {
    const idQuarto = input.id_quarto;
    const numero = input.numero ? input.numero.trim().toUpperCase() : '';
    const modelo = input.modelo;
    const capacidade = Number(input.capacidade);
    const situacao = input.situacao;

    // Validações
    if (!idQuarto) {
      return { success: false, message: 'ID do quarto é obrigatório.' };
    }

    if (!numero) {
      return { success: false, message: 'O número do quarto é obrigatório.' };
    }

    if (modelo !== 'simples' && modelo !== 'suíte') {
      return { success: false, message: 'Modelo inválido. Escolha simples ou suíte.' };
    }

    if (isNaN(capacidade) || capacidade < 1) {
      return { success: false, message: 'A capacidade deve ser maior ou igual a 1.' };
    }

    if (situacao !== 'limpo' && situacao !== 'sujo' && situacao !== 'manutenção') {
      return { success: false, message: 'Situação de quarto inválida.' };
    }

    // Verificar se existe outro quarto com o mesmo número
    const checkStmt = db.prepare('SELECT id_quarto FROM quarto WHERE numero = ? AND id_quarto <> ?');
    const existing = checkStmt.get(numero, idQuarto);
    if (existing) {
      return { success: false, message: 'Outro quarto já possui este número cadastrado.' };
    }

    // Executa atualização
    const updateStmt = db.prepare(`
      UPDATE quarto
      SET numero = ?, modelo = ?, capacidade = ?, situacao = ?
      WHERE id_quarto = ?
    `);
    updateStmt.run(numero, modelo, capacidade, situacao, idQuarto);

    return { success: true, message: 'Quarto atualizado com sucesso!' };
  } catch (error: any) {
    console.error('Erro ao atualizar quarto:', error);
    return {
      success: false,
      message: `Erro interno ao atualizar quarto: ${error.message || error}`
    };
  }
}
