/**
 * hostelGerente - Backend de Cadastro de Hóspede
 * Caminho: src/app/hospede/cadastro_hospede.ts
 */

export interface CadastroHospedePFInput {
  tipo: 'PF';
  nome_completo: string;
  rg?: string;
  cpf: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
}

export interface CadastroHospedePJInput {
  tipo: 'PJ';
  nome_fantasia?: string;
  razao_social: string;
  cnpj: string;
  data_fundacao?: string;
  telefone?: string;
  email?: string;
}

export type CadastroHospedeInput = CadastroHospedePFInput | CadastroHospedePJInput;

export interface ResultFormat {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Validação Matemática Oficial do CPF (Algoritmo de Dígitos Verificadores)
 */
export function validarCPF(cpf: string): boolean {
  // Remove formatação/pontuação
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  if (cleanCPF.length !== 11) return false;

  // CPF não pode ter todos os dígitos repetidos (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação do 1º dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCPF.charAt(9))) return false;

  // Validação do 2º dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Validação Básica de Formato de CNPJ (Apenas numérico e comprimento)
 */
export function validarCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  return true;
}

/**
 * Executa o cadastro do hóspede no banco de dados SQLite.
 * Aceita uma conexão de banco com suporte ao método clássico de prepare/run/get.
 * Exemplo de conexão: node:sqlite (DatabaseSync) ou better-sqlite3.
 */
export function cadastrarHospede(db: any, input: CadastroHospedeInput): ResultFormat {
  try {
    // 1. Sanitizar e Normalizar Dados
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim() : null;

    if (input.tipo === 'PF') {
      const nomeCompleto = input.nome_completo.toUpperCase().trim();
      const rg = input.rg ? input.rg.trim() : null;
      const cpf = input.cpf.replace(/[^\d]/g, ''); // Armazena apenas números para indexação limpa

      // Validação de CPF matemático
      if (!validarCPF(cpf)) {
        return { success: false, message: 'CPF inválido matematicamente.' };
      }

      if (!nomeCompleto) {
        return { success: false, message: 'O nome completo é obrigatório.' };
      }

      // Verificação de duplicidade no banco
      const checkStmt = db.prepare('SELECT id_hospede_pf FROM hospede_cpf WHERE cpf = ?');
      const existing = checkStmt.get(cpf);
      if (existing) {
        return { success: false, message: 'Hóspede já cadastrado com este CPF.' };
      }

      // Inicia transação manual no banco de dados para segurança de concorrência
      db.exec('BEGIN TRANSACTION;');

      try {
        // Inserção em hospede_cpf
        const insertPF = db.prepare(`
          INSERT INTO hospede_cpf (nome_completo, rg, cpf, data_nascimento, telefone, email)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const resultPF = insertPF.run(
          nomeCompleto,
          rg,
          cpf,
          input.data_nascimento || null,
          telefone,
          email
        );
        const idHospedePf = resultPF.lastInsertRowid;

        // Inserção em hospedes (tabela unificadora)
        const insertHospede = db.prepare(`
          INSERT INTO hospedes (id_hospede_pf, id_hospede_pj)
          VALUES (?, NULL)
        `);
        const resultHospede = insertHospede.run(idHospedePf);
        const idHospedes = resultHospede.lastInsertRowid;

        db.exec('COMMIT;');

        return {
          success: true,
          message: 'Hóspede Pessoa Física cadastrado com sucesso!',
          data: { id_hospedes: idHospedes, id_hospede_pf: idHospedePf }
        };
      } catch (err: any) {
        db.exec('ROLLBACK;');
        throw err;
      }

    } else if (input.tipo === 'PJ') {
      const razaoSocial = input.razao_social.toUpperCase().trim();
      const nomeFantasia = input.nome_fantasia ? input.nome_fantasia.toUpperCase().trim() : null;
      const cnpj = input.cnpj.replace(/[^\d]/g, ''); // Armazena apenas números para indexação limpa

      // Validação de formato de CNPJ
      if (!validarCNPJ(cnpj)) {
        return { success: false, message: 'CNPJ inválido.' };
      }

      if (!razaoSocial) {
        return { success: false, message: 'A Razão Social é obrigatória.' };
      }

      // Verificação de duplicidade no banco
      const checkStmt = db.prepare('SELECT id_hospede_pj FROM hospede_pj WHERE cnpj = ?');
      const existing = checkStmt.get(cnpj);
      if (existing) {
        return { success: false, message: 'Empresa já cadastrada com este CNPJ.' };
      }

      // Inicia transação
      db.exec('BEGIN TRANSACTION;');

      try {
        // Inserção em hospede_pj
        const insertPJ = db.prepare(`
          INSERT INTO hospede_pj (nome_fantasia, razao_social, cnpj, data_fundacao, telefone, email)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const resultPJ = insertPJ.run(
          nomeFantasia,
          razaoSocial,
          cnpj,
          input.data_fundacao || null,
          telefone,
          email
        );
        const idHospedePj = resultPJ.lastInsertRowid;

        // Inserção em hospedes (tabela unificadora)
        const insertHospede = db.prepare(`
          INSERT INTO hospedes (id_hospede_pf, id_hospede_pj)
          VALUES (NULL, ?)
        `);
        const resultHospede = insertHospede.run(idHospedePj);
        const idHospedes = resultHospede.lastInsertRowid;

        db.exec('COMMIT;');

        return {
          success: true,
          message: 'Hóspede Pessoa Jurídica cadastrado com sucesso!',
          data: { id_hospedes: idHospedes, id_hospede_pj: idHospedePj }
        };
      } catch (err: any) {
        db.exec('ROLLBACK;');
        throw err;
      }
    } else {
      return { success: false, message: 'Tipo de hóspede inválido.' };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Erro interno ao cadastrar hóspede: ${error.message || error}`
    };
  }
}
