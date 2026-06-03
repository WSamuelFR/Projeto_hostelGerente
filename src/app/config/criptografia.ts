/**
 * hostelGerente - Módulo de Criptografia de Senhas (Node.js Native)
 * Caminho: src/app/config/criptografia.ts
 */

import * as crypto from 'crypto';


/**
 * Gera um hash seguro para a senha utilizando o algoritmo Scrypt.
 * Retorna uma string no formato 'salt:hash'.
 */
export function gerarHashSenha(senha: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  // Parâmetros recomendados para scrypt: keyLen = 64 bytes
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compara uma senha em texto plano com o hash salvo para verificar correspondência.
 */
export function compararSenha(senha: string, hashSalvo: string): boolean {
  try {
    const parts = hashSalvo.split(':');
    if (parts.length !== 2) return false;
    
    const [salt, hash] = parts;
    const hashComparar = crypto.scryptSync(senha, salt, 64).toString('hex');
    
    // Comparação de tempo constante para prevenir ataques de temporização (timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(hashComparar, 'hex')
    );
  } catch (error) {
    return false;
  }
}
