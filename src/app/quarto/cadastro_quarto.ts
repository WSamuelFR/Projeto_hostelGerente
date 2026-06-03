/**
 * hostelGerente - Backend de Cadastro de Quarto
 * Caminho: src/app/quarto/cadastro_quarto.ts
 */

export interface CadastroQuartoInput {
  numero: string;
  modelo: 'simples' | 'suíte';
  capacidade: number;
  situacao: 'limpo' | 'sujo' | 'manutenção';
}

export interface ResultFormat {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Executa o cadastro do quarto no banco de dados SQLite.
 */
export function cadastrarQuarto(db: any, input: CadastroQuartoInput): ResultFormat {
  try {
    // 1. Sanitizar e Normalizar Dados
    const numero = input.numero ? input.numero.trim().toUpperCase() : '';
    const modelo = input.modelo;
    const capacidade = Number(input.capacidade);
    const situacao = input.situacao;

    // 2. Validações de Negócio
    if (!numero) {
      return { success: false, message: 'O número do quarto é obrigatório.' };
    }

    if (modelo !== 'simples' && modelo !== 'suíte') {
      return { success: false, message: 'Modelo de quarto inválido. Escolha entre simples ou suíte.' };
    }

    if (isNaN(capacidade) || capacidade < 1) {
      return { success: false, message: 'A capacidade deve ser um número maior ou igual a 1.' };
    }

    if (situacao !== 'limpo' && situacao !== 'sujo' && situacao !== 'manutenção') {
      return { success: false, message: 'Situação de quarto inválida.' };
    }

    // 3. Verificação de duplicidade no banco
    const checkStmt = db.prepare('SELECT id_quarto FROM quarto WHERE numero = ?');
    const existing = checkStmt.get(numero);
    if (existing) {
      return { success: false, message: 'Já existe um quarto cadastrado com este número.' };
    }

    // 4. Inserção no banco
    const insertStmt = db.prepare(`
      INSERT INTO quarto (numero, modelo, capacidade, situacao)
      VALUES (?, ?, ?, ?)
    `);
    const result = insertStmt.run(numero, modelo, capacidade, situacao);
    const idQuarto = result.lastInsertRowid;

    return {
      success: true,
      message: 'Quarto cadastrado com sucesso!',
      data: { id_quarto: idQuarto, numero }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro interno ao cadastrar quarto: ${error.message || error}`
    };
  }
}
