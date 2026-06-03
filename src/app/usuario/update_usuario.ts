/**
 * hostelGerente - Backend de Gerenciamento e Atualização de Usuários
 * Caminho: src/app/usuario/update_usuario.ts
 */

import { validarCPF } from '../hospede/cadastro_hospede';
import { gerarHashSenha } from '../config/criptografia';

export interface UsuarioUnificado {
  id_usuario: number;
  nome_completo: string;
  rg: string | null;
  cpf: string;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  id_login: number | null;
  nome_usuario: string | null;
  nivel: 'admin' | 'padrao' | null;
}

export interface UpdateUsuarioInput {
  id_usuario: number;
  id_login: number;
  nome_completo: string;
  rg?: string;
  cpf: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  nome_usuario: string;
  senha?: string; // Opcional (se em branco, não altera a senha)
  nivel: 'admin' | 'padrao';
}

export interface UpdateResult {
  success: boolean;
  message: string;
}

/**
 * Retorna todos os usuários unificados com login e nível de acesso em ordem alfabética.
 */
export function listarUsuarios(db: any): UsuarioUnificado[] {
  try {
    const stmt = db.prepare(`
      SELECT 
        u.id_usuario,
        u.nome_completo,
        u.rg,
        u.cpf,
        u.data_nascimento,
        u.telefone,
        u.email,
        l.id_login,
        l.nome_usuario,
        n.nivel
      FROM usuario u
      LEFT JOIN login l ON u.id_usuario = l.id_usuario
      LEFT JOIN nivel_acesso n ON u.id_usuario = n.id_usuario
      ORDER BY u.nome_completo ASC
    `);

    return stmt.all ? stmt.all() : (stmt.allObjects ? stmt.allObjects() : []);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return [];
  }
}

/**
 * Atualiza os dados de um usuário no SQLite.
 */
export function atualizarUsuario(db: any, input: UpdateUsuarioInput): UpdateResult {
  try {
    const nomeCompleto = input.nome_completo.toUpperCase().trim();
    const rg = input.rg ? input.rg.trim() : null;
    const cpf = input.cpf.replace(/[^\d]/g, '');
    const nomeUsuario = input.nome_usuario.toUpperCase().trim();
    const nivel = input.nivel;
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim() : null;

    // Validações
    if (!nomeCompleto) {
      return { success: false, message: 'O nome completo é obrigatório.' };
    }

    if (!validarCPF(cpf)) {
      return { success: false, message: 'CPF inválido matematicamente.' };
    }

    if (!nomeUsuario) {
      return { success: false, message: 'O Nome de Usuário é obrigatório.' };
    }

    // Checagem de duplicidade do CPF
    const checkCpf = db.prepare('SELECT id_usuario FROM usuario WHERE cpf = ? AND id_usuario <> ?');
    const existingCpf = checkCpf.get(cpf, input.id_usuario);
    if (existingCpf) {
      return { success: false, message: 'Outro funcionário já está cadastrado com este CPF.' };
    }

    // Checagem de duplicidade do Username
    const checkUser = db.prepare('SELECT id_login FROM login WHERE nome_usuario = ? AND id_login <> ?');
    const existingUser = checkUser.get(nomeUsuario, input.id_login);
    if (existingUser) {
      return { success: false, message: 'Nome de Usuário (Username) já está em uso.' };
    }

    // Iniciar Transação
    db.exec('BEGIN TRANSACTION;');

    try {
      // 1. Atualizar Tabela usuario
      const updateUsuario = db.prepare(`
        UPDATE usuario
        SET nome_completo = ?, rg = ?, cpf = ?, data_nascimento = ?, telefone = ?, email = ?
        WHERE id_usuario = ?
      `);
      updateUsuario.run(
        nomeCompleto,
        rg,
        cpf,
        input.data_nascimento || null,
        telefone,
        email,
        input.id_usuario
      );

      // 2. Atualizar Tabela login (Senha condicional)
      if (input.senha && input.senha.trim() !== '') {
        const senha = input.senha.trim();
        if (senha.length < 6) {
          throw new Error('A nova senha deve conter no mínimo 6 caracteres.');
        }
        
        // Hashing da nova senha
        const hashSenha = gerarHashSenha(senha);
        
        const updateLoginWithPass = db.prepare(`
          UPDATE login
          SET nome_usuario = ?, senha = ?
          WHERE id_login = ?
        `);
        updateLoginWithPass.run(nomeUsuario, hashSenha, input.id_login);
      } else {
        const updateLogin = db.prepare(`
          UPDATE login
          SET nome_usuario = ?
          WHERE id_login = ?
        `);
        updateLogin.run(nomeUsuario, input.id_login);
      }

      // 3. Atualizar Tabela nivel_acesso
      const updateNivel = db.prepare(`
        UPDATE nivel_acesso
        SET nivel = ?
        WHERE id_usuario = ? AND id_login = ?
      `);
      updateNivel.run(nivel, input.id_usuario, input.id_login);

      db.exec('COMMIT;');
      
      return { success: true, message: 'Cadastro do funcionário atualizado com sucesso!' };
    } catch (err: any) {
      db.exec('ROLLBACK;');
      return { success: false, message: err.message || 'Erro durante a atualização no banco de dados.' };
    }
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return {
      success: false,
      message: `Erro interno ao atualizar funcionário: ${error.message || error}`
    };
  }
}
