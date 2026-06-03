/**
 * hostelGerente - Backend de Login
 * Caminho: src/app/login/gerencia_login.ts
 */

import { compararSenha } from '../config/criptografia';

export interface EfetuarLoginInput {
  nome_usuario: string;
  senha: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  usuario?: {
    id_usuario: number;
    nome_completo: string;
    nome_usuario: string;
    nivel: 'admin' | 'padrao';
  };
}

/**
 * Autentica um funcionário no sistema hostelGerente utilizando o SQLite.
 */
export function efetuarLogin(db: any, input: EfetuarLoginInput): LoginResult {
  try {
    const nomeUsuario = input.nome_usuario.toUpperCase().trim();
    const senha = input.senha;

    if (!nomeUsuario || !senha) {
      return { success: false, message: 'Nome de usuário e senha são obrigatórios.' };
    }

    // 1. Buscar as credenciais do usuário na tabela login
    const findLoginStmt = db.prepare(`
      SELECT id_login, id_usuario, senha 
      FROM login 
      WHERE nome_usuario = ?
    `);
    const credenciais = findLoginStmt.get(nomeUsuario);

    if (!credenciais) {
      return { success: false, message: 'Usuário ou senha incorretos.' };
    }

    // 2. Comparar a senha com o hash salvo
    const match = compararSenha(senha, credenciais.senha);
    if (!match) {
      return { success: false, message: 'Usuário ou senha incorretos.' };
    }

    // 3. Buscar dados pessoais do usuário e nível de acesso
    const findUserStmt = db.prepare(`
      SELECT u.id_usuario, u.nome_completo, n.nivel
      FROM usuario u
      LEFT JOIN nivel_acesso n ON u.id_usuario = n.id_usuario
      WHERE u.id_usuario = ?
    `);
    const usuarioInfo = findUserStmt.get(credenciais.id_usuario);

    if (!usuarioInfo) {
      return { success: false, message: 'Dados cadastrais do usuário não encontrados.' };
    }

    return {
      success: true,
      message: 'Autenticação realizada com sucesso!',
      usuario: {
        id_usuario: usuarioInfo.id_usuario,
        nome_completo: usuarioInfo.nome_completo,
        nome_usuario: nomeUsuario,
        nivel: usuarioInfo.nivel || 'padrao'
      }
    };
  } catch (error: any) {
    console.error('Erro ao efetuar login:', error);
    return {
      success: false,
      message: `Erro interno no servidor de autenticação: ${error.message || error}`
    };
  }
}
