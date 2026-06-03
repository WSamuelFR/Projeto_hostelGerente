/**
 * hostelGerente - Database Schema Setup
 * Tec-stack: SQLite / TypeScript
 */

// Define as chaves estrangeiras como habilitadas por padrão
export const PRAGMA_FOREIGN_KEYS = 'PRAGMA foreign_keys = ON;';

// Lista de tabelas ativas e necessárias na ordem correta de dependência (criação)
export const TABLES = [
  // 1. hospede_cpf
  `CREATE TABLE IF NOT EXISTS hospede_cpf (
    id_hospede_pf INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    rg TEXT,
    cpf TEXT UNIQUE NOT NULL,
    data_nascimento TEXT,
    telefone TEXT,
    email TEXT
  );`,

  // 2. hospede_pj
  `CREATE TABLE IF NOT EXISTS hospede_pj (
    id_hospede_pj INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_fantasia TEXT,
    razao_social TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    data_fundacao TEXT,
    telefone TEXT,
    email TEXT
  );`,

  // 3. hospedes (unificadora de PF e PJ)
  `CREATE TABLE IF NOT EXISTS hospedes (
    id_hospedes INTEGER PRIMARY KEY AUTOINCREMENT,
    id_hospede_pj INTEGER NULL,
    id_hospede_pf INTEGER NULL,
    FOREIGN KEY (id_hospede_pj) REFERENCES hospede_pj(id_hospede_pj) ON DELETE CASCADE,
    FOREIGN KEY (id_hospede_pf) REFERENCES hospede_cpf(id_hospede_pf) ON DELETE CASCADE,
    CHECK (id_hospede_pj IS NOT NULL OR id_hospede_pf IS NOT NULL)
  );`,

  // 4. usuario
  `CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    rg TEXT,
    cpf TEXT UNIQUE NOT NULL,
    data_nascimento TEXT,
    telefone TEXT,
    email TEXT
  );`,

  // 5. login
  `CREATE TABLE IF NOT EXISTS login (
    id_login INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL UNIQUE,
    nome_usuario TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
  );`,

  // 6. nivel_acesso
  `CREATE TABLE IF NOT EXISTS nivel_acesso (
    id_nivel_acesso INTEGER PRIMARY KEY AUTOINCREMENT,
    id_login INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    nivel TEXT NOT NULL CHECK(nivel IN ('admin', 'padrao')),
    FOREIGN KEY (id_login) REFERENCES login(id_login) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
  );`,

  // 7. quarto
  `CREATE TABLE IF NOT EXISTS quarto (
    id_quarto INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT UNIQUE NOT NULL,
    modelo TEXT NOT NULL CHECK(modelo IN ('simples', 'suíte')),
    capacidade INTEGER NOT NULL,
    situacao TEXT NOT NULL CHECK(situacao IN ('limpo', 'sujo', 'manutenção'))
  );`,

  // 8. checkin
  `CREATE TABLE IF NOT EXISTS checkin (
    id_checkin INTEGER PRIMARY KEY AUTOINCREMENT,
    id_hospedes INTEGER NOT NULL,
    id_quarto INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    nome TEXT NOT NULL,
    documento TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    data_hora_checkin TEXT NOT NULL,
    data_hora_checkout TEXT,
    situacao TEXT NOT NULL CHECK(situacao IN ('ativo', 'encerrado')),
    FOREIGN KEY (id_hospedes) REFERENCES hospedes(id_hospedes),
    FOREIGN KEY (id_quarto) REFERENCES quarto(id_quarto),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  );`,

  // 9. ocupantes_checkin
  `CREATE TABLE IF NOT EXISTS ocupantes_checkin (
    id_ocupantes_checkin INTEGER PRIMARY KEY AUTOINCREMENT,
    id_checkin INTEGER NOT NULL,
    id_hospedes INTEGER NOT NULL,
    nome TEXT NOT NULL,
    documento TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    FOREIGN KEY (id_checkin) REFERENCES checkin(id_checkin) ON DELETE CASCADE,
    FOREIGN KEY (id_hospedes) REFERENCES hospedes(id_hospedes)
  );`,

  // 10. reserva
  `CREATE TABLE IF NOT EXISTS reserva (
    id_reserva INTEGER PRIMARY KEY AUTOINCREMENT,
    id_hospedes INTEGER NOT NULL,
    id_quarto INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    nome TEXT NOT NULL,
    documento TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    numero_ocupantes INTEGER NOT NULL DEFAULT 1,
    data_reserva TEXT DEFAULT CURRENT_TIMESTAMP,
    data_checkin TEXT NOT NULL,
    data_checkout TEXT NOT NULL,
    usuario_responsavel TEXT NOT NULL,
    data_processo TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_hospedes) REFERENCES hospedes(id_hospedes),
    FOREIGN KEY (id_quarto) REFERENCES quarto(id_quarto),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  );`
];

// SCHEMA completo consolidado das tabelas ativas
export const SCHEMA = TABLES.join('\n\n');

/**
 * Inicializa a conexão e aplica o esquema das tabelas ativas,
 * realizando também a limpeza de tabelas antigas/inativas.
 */
export function inicializarBanco(db: { exec: (sql: string) => any }): void {
  // Desativa chaves estrangeiras temporariamente para rodar a limpeza
  db.exec('PRAGMA foreign_keys = OFF;');
  
  // Limpeza de tabelas inativas
  db.exec(`
    DROP TABLE IF EXISTS financeiro;
    DROP TABLE IF EXISTS pagamento_chekin;
    DROP TABLE IF EXISTS consumo_checkin;
    DROP TABLE IF EXISTS venda_balcao;
    DROP TABLE IF EXISTS produtos;
    DROP TABLE IF EXISTS logs;
  `);

  // Ativa chaves estrangeiras
  db.exec(PRAGMA_FOREIGN_KEYS);
  
  // Executa o schema completo das tabelas ativas
  db.exec(SCHEMA);
}
