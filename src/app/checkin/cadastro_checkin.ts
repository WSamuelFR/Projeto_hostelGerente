/**
 * hostelGerente - Backend de Cadastro de Check-in
 * Caminho: src/app/checkin/cadastro_checkin.ts
 */

export interface AcompanhanteInput {
  id_hospedes: number;
  nome: string;
  documento: string;
  telefone?: string;
  email?: string;
}

export interface CadastroCheckinInput {
  id_hospedes: number;
  id_quarto: number;
  id_usuario: number;
  nome: string;
  documento: string;
  telefone?: string;
  email?: string;
  data_hora_checkin?: string;
  acompanhantes?: AcompanhanteInput[];
}

export interface ResultFormat {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Registra o check-in no banco de dados SQLite dentro de uma transação.
 */
export function cadastrarCheckin(db: any, input: CadastroCheckinInput): ResultFormat {
  try {
    // 1. Sanitizar e Normalizar Dados
    const idHospedes = Number(input.id_hospedes);
    const idQuarto = Number(input.id_quarto);
    const idUsuario = Number(input.id_usuario);
    const nome = input.nome ? input.nome.trim().toUpperCase() : '';
    const documento = input.documento ? input.documento.trim().replace(/[^\d]/g, '') : '';
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim().toLowerCase() : null;
    
    // Define data_hora_checkin caso não fornecida
    let dataHoraCheckin = input.data_hora_checkin ? input.data_hora_checkin.trim() : '';
    if (!dataHoraCheckin) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      dataHoraCheckin = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    // 2. Validações
    if (!idHospedes) {
      return { success: false, message: 'O hóspede principal é obrigatório.' };
    }
    if (!idQuarto) {
      return { success: false, message: 'O quarto é obrigatório.' };
    }
    if (!idUsuario) {
      return { success: false, message: 'O usuário responsável é obrigatório.' };
    }
    if (!nome) {
      return { success: false, message: 'O nome do ocupante principal é obrigatório.' };
    }
    if (!documento) {
      return { success: false, message: 'O documento do ocupante principal é obrigatório.' };
    }

    // Verificar se o quarto existe e se está livre (limpo)
    const checkQuarto = db.prepare('SELECT situacao, numero FROM quarto WHERE id_quarto = ?');
    const quartoInfo = checkQuarto.get(idQuarto);
    if (!quartoInfo) {
      return { success: false, message: 'Quarto selecionado não existe.' };
    }
    if (quartoInfo.situacao !== 'limpo') {
      return { success: false, message: `O quarto ${quartoInfo.numero} não está disponível para check-in (Situação: ${quartoInfo.situacao}).` };
    }

    // 3. Início da transação
    db.exec('BEGIN TRANSACTION;');

    try {
      // Inserção na tabela checkin
      const insertCheckin = db.prepare(`
        INSERT INTO checkin (id_hospedes, id_quarto, id_usuario, nome, documento, telefone, email, data_hora_checkin, situacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo')
      `);
      const resultCheckin = insertCheckin.run(
        idHospedes,
        idQuarto,
        idUsuario,
        nome,
        documento,
        telefone,
        email,
        dataHoraCheckin
      );
      const idCheckin = resultCheckin.lastInsertRowid;

      // Inserção dos acompanhantes na tabela ocupantes_checkin
      if (input.acompanhantes && input.acompanhantes.length > 0) {
        const insertOcupante = db.prepare(`
          INSERT INTO ocupantes_checkin (id_checkin, id_hospedes, nome, documento, email, telefone)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const ac of input.acompanhantes) {
          const acIdHospedes = Number(ac.id_hospedes);
          const acNome = ac.nome ? ac.nome.trim().toUpperCase() : '';
          const acDoc = ac.documento ? ac.documento.trim().replace(/[^\d]/g, '') : '';
          const acTel = ac.telefone ? ac.telefone.trim() : null;
          const acEmail = ac.email ? ac.email.trim().toLowerCase() : null;

          if (!acIdHospedes || !acNome || !acDoc) {
            throw new Error('Todos os campos obrigatórios do acompanhante devem ser fornecidos.');
          }

          insertOcupante.run(idCheckin, acIdHospedes, acNome, acDoc, acEmail, acTel);
        }
      }

      db.exec('COMMIT;');

      return {
        success: true,
        message: 'Check-in registrado com sucesso!',
        data: { id_checkin: idCheckin }
      };
    } catch (err: any) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Erro interno ao cadastrar check-in: ${error.message || error}`
    };
  }
}
