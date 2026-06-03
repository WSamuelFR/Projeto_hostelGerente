/**
 * hostelGerente - Backend de Cadastro de Usuário
 * Caminho: src/app/usuario/cadastro_usuario.ts
 */

import { validarCPF } from '../hospede/cadastro_hospede';
import { gerarHashSenha } from '../config/criptografia';

export interface CadastroUsuarioInput {
  nome_completo: string;
  rg?: string;
  cpf: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  nome_usuario: string;
  senha: string;
  nivel: 'admin' | 'padrao';
}

export interface ResultFormat {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Cadastra um novo usuário funcionário com credenciais e nível de acesso no banco de dados SQLite.
 */
export function cadastrarUsuario(db: any, input: CadastroUsuarioInput): ResultFormat {
  try {
    // 1. Sanitização e Normalização
    const nomeCompleto = input.nome_completo.toUpperCase().trim();
    const rg = input.rg ? input.rg.trim() : null;
    const cpf = input.cpf.replace(/[^\d]/g, ''); // Apenas dígitos para indexação
    const nomeUsuario = input.nome_usuario.toUpperCase().trim();
    const senha = input.senha;
    const nivel = input.nivel;
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim() : null;

    // 2. Validações Iniciais
    if (!nomeCompleto) {
      return { success: false, message: 'O nome completo é obrigatório.' };
    }

    if (!validarCPF(cpf)) {
      return { success: false, message: 'CPF inválido matematicamente.' };
    }

    if (!nomeUsuario) {
      return { success: false, message: 'O Nome de Usuário é obrigatório.' };
    }

    if (!senha || senha.length < 6) {
      return { success: false, message: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    if (nivel !== 'admin' && nivel !== 'padrao') {
      return { success: false, message: 'Nível de acesso inválido.' };
    }

    // 3. Checagem de Duplicidade (CPF e Username)
    const checkCpfStmt = db.prepare('SELECT id_usuario FROM usuario WHERE cpf = ?');
    const existingCpf = checkCpfStmt.get(cpf);
    if (existingCpf) {
      return { success: false, message: 'Já existe um funcionário cadastrado com este CPF.' };
    }

    const checkUserStmt = db.prepare('SELECT id_login FROM login WHERE nome_usuario = ?');
    const existingUser = checkUserStmt.get(nomeUsuario);
    if (existingUser) {
      return { success: false, message: 'Nome de Usuário (Username) já está em uso.' };
    }

    // 4. Execução da Transação no SQLite
    db.exec('BEGIN TRANSACTION;');

    try {
      // Inserção 1: Tabela usuario
      const insertUsuario = db.prepare(`
        INSERT INTO usuario (nome_completo, rg, cpf, data_nascimento, telefone, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const resultUsuario = insertUsuario.run(
        nomeCompleto,
        rg,
        cpf,
        input.data_nascimento || null,
        telefone,
        email
      );
      const idUsuario = resultUsuario.lastInsertRowid;

      // Criptografia da senha
      const hashSenha = gerarHashSenha(senha);

      // Inserção 2: Tabela login
      const insertLogin = db.prepare(`
        INSERT INTO login (id_usuario, nome_usuario, senha)
        VALUES (?, ?, ?)
      `);
      const resultLogin = insertLogin.run(idUsuario, nomeUsuario, hashSenha);
      const idLogin = resultLogin.lastInsertRowid;

      // Inserção 3: Tabela nivel_acesso
      const insertNivel = db.prepare(`
        INSERT INTO nivel_acesso (id_login, id_usuario, nivel)
        VALUES (?, ?, ?)
      `);
      insertNivel.run(idLogin, idUsuario, nivel);

      db.exec('COMMIT;');

      return {
        success: true,
        message: 'Funcionário cadastrado com sucesso!',
        data: { id_usuario: idUsuario, id_login: idLogin }
      };
    } catch (err: any) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    console.error('Erro ao cadastrar usuário:', error);
    return {
      success: false,
      message: `Erro interno ao cadastrar funcionário: ${error.message || error}`
    };
  }
}
