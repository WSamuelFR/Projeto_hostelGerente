/**
 * hostelGerente - Backend de Gerenciamento e Atualização de Check-in
 * Caminho: src/app/checkin/update_checkin.ts
 */

export interface Acompanhante {
  id_hospedes: number;
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
}

export interface Checkin {
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

export interface ResultFormat {
  success: boolean;
  message: string;
}

/**
 * Retorna todos os check-ins cadastrados no banco, com os acompanhantes e dados do quarto/usuário associados.
 */
export function listarCheckins(db: any): Checkin[] {
  try {
    const stmt = db.prepare(`
      SELECT 
        c.id_checkin,
        c.id_hospedes,
        c.id_quarto,
        c.id_usuario,
        c.nome,
        c.documento,
        c.telefone,
        c.email,
        c.data_hora_checkin,
        c.data_hora_checkout,
        c.situacao,
        q.numero AS numero_quarto,
        u.nome_completo AS nome_usuario
      FROM checkin c
      LEFT JOIN quarto q ON c.id_quarto = q.id_quarto
      LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
      ORDER BY c.data_hora_checkin DESC
    `);
    
    const checkins: Checkin[] = stmt.all ? stmt.all() : (stmt.allObjects ? stmt.allObjects() : []);
    
    const stmtOcupantes = db.prepare(`
      SELECT id_hospedes, nome, documento, email, telefone 
      FROM ocupantes_checkin 
      WHERE id_checkin = ?
    `);

    for (const c of checkins) {
      c.acompanhantes = stmtOcupantes.all ? stmtOcupantes.all(c.id_checkin) : (stmtOcupantes.allObjects ? stmtOcupantes.allObjects(c.id_checkin) : []);
    }

    return checkins;
  } catch (error) {
    console.error('Erro ao listar check-ins:', error);
    return [];
  }
}

/**
 * Encerra o check-in (realiza o check-out), atualiza a data de checkout e define a situação do quarto como 'sujo'.
 */
export function encerrarCheckin(db: any, idCheckin: number): ResultFormat {
  try {
    if (!idCheckin) {
      return { success: false, message: 'ID do check-in é obrigatório.' };
    }

    // Obter o ID do quarto associado ao check-in
    const queryCheckin = db.prepare('SELECT id_quarto, situacao FROM checkin WHERE id_checkin = ?');
    const checkinInfo = queryCheckin.get(idCheckin);
    if (!checkinInfo) {
      return { success: false, message: 'Check-in não encontrado.' };
    }
    if (checkinInfo.situacao === 'encerrado') {
      return { success: false, message: 'Este check-in já se encontra encerrado.' };
    }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dataHoraCheckout = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    db.exec('BEGIN TRANSACTION;');

    try {
      // 1. Atualizar o check-in para encerrado
      const updateCheckin = db.prepare(`
        UPDATE checkin
        SET situacao = 'encerrado', data_hora_checkout = ?
        WHERE id_checkin = ?
      `);
      updateCheckin.run(dataHoraCheckout, idCheckin);

      // 2. Atualizar o quarto correspondente para 'sujo'
      const updateQuarto = db.prepare(`
        UPDATE quarto
        SET situacao = 'sujo'
        WHERE id_quarto = ?
      `);
      updateQuarto.run(checkinInfo.id_quarto);

      db.exec('COMMIT;');

      return { success: true, message: 'Check-out realizado com sucesso! O quarto correspondente foi definido como sujo para limpeza.' };
    } catch (err: any) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    console.error('Erro ao realizar check-out:', error);
    return {
      success: false,
      message: `Erro interno ao realizar check-out: ${error.message || error}`
    };
  }
}

/**
 * Exclui o check-in do banco de dados. Os acompanhantes são excluídos automaticamente em cascata.
 */
export function deletarCheckin(db: any, idCheckin: number): ResultFormat {
  try {
    if (!idCheckin) {
      return { success: false, message: 'ID do check-in é obrigatório.' };
    }

    const stmt = db.prepare('DELETE FROM checkin WHERE id_checkin = ?');
    stmt.run(idCheckin);

    return { success: true, message: 'Registro de check-in excluído com sucesso!' };
  } catch (error: any) {
    console.error('Erro ao excluir check-in:', error);
    return {
      success: false,
      message: `Erro interno ao excluir check-in: ${error.message || error}`
    };
  }
}
