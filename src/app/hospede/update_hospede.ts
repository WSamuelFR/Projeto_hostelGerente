/**
 * hostelGerente - Backend de Gerenciamento e Atualização de Hóspedes
 * Caminho: src/app/hospede/update_hospede.ts
 */

import { validarCPF, validarCNPJ } from './cadastro_hospede';

export interface HospedeUnificado {
  id_hospedes: number;
  id_hospede_pf: number | null;
  id_hospede_pj: number | null;
  tipo: 'PF' | 'PJ';
  nome: string; // Nome Completo ou Razão Social
  telefone: string | null;
  email: string | null;
  rg?: string | null;
  cpf?: string | null;
  data_nascimento?: string | null;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  data_fundacao?: string | null;
}

export interface UpdateHospedeInput {
  id_hospedes: number;
  tipo: 'PF' | 'PJ';
  id_tipo: number; // id_hospede_pf ou id_hospede_pj
  nome_completo?: string; // Para PF
  rg?: string; // Para PF
  cpf?: string; // Para PF
  data_nascimento?: string; // Para PF
  razao_social?: string; // Para PJ
  nome_fantasia?: string; // Para PJ
  cnpj?: string; // Para PJ
  data_fundacao?: string; // Para PJ
  telefone?: string;
  email?: string;
}

export interface UpdateResult {
  success: boolean;
  message: string;
}

/**
 * Retorna todos os hóspedes unificados do banco de dados (PF + PJ) em ordem alfabética.
 */
export function listarHospedes(db: any): HospedeUnificado[] {
  try {
    const stmt = db.prepare(`
      SELECT 
        h.id_hospedes,
        h.id_hospede_pf,
        h.id_hospede_pj,
        CASE WHEN h.id_hospede_pf IS NOT NULL THEN 'PF' ELSE 'PJ' END as tipo,
        COALESCE(pf.nome_completo, pj.razao_social) AS nome,
        COALESCE(pf.telefone, pj.telefone) AS telefone,
        COALESCE(pf.email, pj.email) AS email,
        pf.rg,
        pf.cpf,
        pf.data_nascimento,
        pj.nome_fantasia,
        pj.cnpj,
        pj.data_fundacao
      FROM hospedes h
      LEFT JOIN hospede_cpf pf ON h.id_hospede_pf = pf.id_hospede_pf
      LEFT JOIN hospede_pj pj ON h.id_hospede_pj = pj.id_hospede_pj
      ORDER BY nome ASC
    `);
    
    return stmt.all ? stmt.all() : (stmt.allObjects ? stmt.allObjects() : []);
  } catch (error) {
    console.error('Erro ao listar hóspedes:', error);
    return [];
  }
}

/**
 * Atualiza as informações de um hóspede.
 */
export function atualizarHospede(db: any, input: UpdateHospedeInput): UpdateResult {
  try {
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim() : null;

    if (input.tipo === 'PF') {
      const nomeCompleto = input.nome_completo ? input.nome_completo.toUpperCase().trim() : '';
      const rg = input.rg ? input.rg.trim() : null;
      const cpf = input.cpf ? input.cpf.replace(/[^\d]/g, '') : '';

      if (!nomeCompleto) {
        return { success: false, message: 'O nome completo é obrigatório.' };
      }

      if (!cpf || !validarCPF(cpf)) {
        return { success: false, message: 'CPF inválido.' };
      }

      // Verificação de duplicidade (outro hóspede com o mesmo CPF)
      const checkStmt = db.prepare('SELECT id_hospede_pf FROM hospede_cpf WHERE cpf = ? AND id_hospede_pf <> ?');
      const existing = checkStmt.get(cpf, input.id_tipo);
      if (existing) {
        return { success: false, message: 'Outro hóspede já possui este CPF cadastrado.' };
      }

      // Atualiza hospede_cpf
      const updatePF = db.prepare(`
        UPDATE hospede_cpf 
        SET nome_completo = ?, rg = ?, cpf = ?, data_nascimento = ?, telefone = ?, email = ?
        WHERE id_hospede_pf = ?
      `);
      updatePF.run(
        nomeCompleto,
        rg,
        cpf,
        input.data_nascimento || null,
        telefone,
        email,
        input.id_tipo
      );

      return { success: true, message: 'Hóspede Pessoa Física atualizado com sucesso!' };

    } else if (input.tipo === 'PJ') {
      const razaoSocial = input.razao_social ? input.razao_social.toUpperCase().trim() : '';
      const nomeFantasia = input.nome_fantasia ? input.nome_fantasia.toUpperCase().trim() : null;
      const cnpj = input.cnpj ? input.cnpj.replace(/[^\d]/g, '') : '';

      if (!razaoSocial) {
        return { success: false, message: 'A Razão Social é obrigatória.' };
      }

      if (!cnpj || !validarCNPJ(cnpj)) {
        return { success: false, message: 'CNPJ inválido.' };
      }

      // Verificação de duplicidade (outra empresa com o mesmo CNPJ)
      const checkStmt = db.prepare('SELECT id_hospede_pj FROM hospede_pj WHERE cnpj = ? AND id_hospede_pj <> ?');
      const existing = checkStmt.get(cnpj, input.id_tipo);
      if (existing) {
        return { success: false, message: 'Outra empresa já possui este CNPJ cadastrado.' };
      }

      // Atualiza hospede_pj
      const updatePJ = db.prepare(`
        UPDATE hospede_pj 
        SET nome_fantasia = ?, razao_social = ?, cnpj = ?, data_fundacao = ?, telefone = ?, email = ?
        WHERE id_hospede_pj = ?
      `);
      updatePJ.run(
        nomeFantasia,
        razaoSocial,
        cnpj,
        input.data_fundacao || null,
        telefone,
        email,
        input.id_tipo
      );

      return { success: true, message: 'Hóspede Pessoa Jurídica atualizado com sucesso!' };
    }

    return { success: false, message: 'Tipo de hóspede inválido.' };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro interno ao atualizar hóspede: ${error.message || error}`
    };
  }
}
