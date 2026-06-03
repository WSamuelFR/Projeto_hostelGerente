/**
 * hostelGerente - Database Schema Setup
 * Tec-stack: SQLite / TypeScript
 */

// Define as chaves estrangeiras como habilitadas por padrão
export const PRAGMA_FOREIGN_KEYS = 'PRAGMA foreign_keys = ON;';

// Lista individual de tabelas na ordem correta de dependência (criação)
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

  // 8. produtos
  `CREATE TABLE IF NOT EXISTS produtos (
    id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT,
    codigo TEXT UNIQUE NOT NULL,
    tributos REAL DEFAULT 0.0,
    preco_custo REAL NOT NULL,
    preco_venda REAL NOT NULL,
    estoque_inicial INTEGER DEFAULT 0,
    estoque_final INTEGER DEFAULT 0,
    data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP
  );`,

  // 9. venda_balcao
  `CREATE TABLE IF NOT EXISTS venda_balcao (
    id_venda_balcao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produto INTEGER NOT NULL,
    id_hospedes INTEGER NULL,
    id_usuario INTEGER NOT NULL,
    produto TEXT NOT NULL,
    preco REAL NOT NULL,
    tributos REAL DEFAULT 0.0,
    tarifa REAL DEFAULT 0.0,
    desconto REAL DEFAULT 0.0,
    total_final REAL NOT NULL,
    metodo_pagamento TEXT NOT NULL CHECK(metodo_pagamento IN ('pix', 'debito', 'credito', 'especie')),
    data_processo TEXT DEFAULT CURRENT_TIMESTAMP,
    usuario_responsavel TEXT NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_hospedes) REFERENCES hospedes(id_hospedes),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  );`,

  // 10. checkin
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

  // 11. ocupantes_checkin
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

  // 12. consumo_checkin
  `CREATE TABLE IF NOT EXISTS consumo_checkin (
    id_venda_checkin INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produto INTEGER NOT NULL,
    id_checkin INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    produto TEXT NOT NULL,
    preco REAL NOT NULL,
    tributos REAL DEFAULT 0.0,
    tarifa REAL DEFAULT 0.0,
    desconto REAL DEFAULT 0.0,
    total_final REAL NOT NULL,
    metodo_pagamento TEXT NOT NULL CHECK(metodo_pagamento IN ('pix', 'debito', 'credito', 'especie')),
    data_processo TEXT DEFAULT CURRENT_TIMESTAMP,
    usuario_responsavel TEXT NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_checkin) REFERENCES checkin(id_checkin) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  );`,

  // 13. pagamento_chekin
  `CREATE TABLE IF NOT EXISTS pagamento_chekin (
    id_pagamento_chekin INTEGER PRIMARY KEY AUTOINCREMENT,
    id_checkin INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    desconto REAL DEFAULT 0.0,
    tarifa REAL DEFAULT 0.0,
    tributos REAL DEFAULT 0.0,
    metodo_pagamento TEXT NOT NULL CHECK(metodo_pagamento IN ('pix', 'debito', 'credito', 'especie')),
    total_final_checkin REAL NOT NULL,
    total_final_consumo REAL NOT NULL,
    total_final REAL NOT NULL,
    usuario_responsavel TEXT NOT NULL,
    data_processo TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_checkin) REFERENCES checkin(id_checkin),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  );`,

  // 14. reserva
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
  );`,

  // 15. logs
  `CREATE TABLE IF NOT EXISTS logs (
    id_logs INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    operacao TEXT NOT NULL,
    data_hora TEXT DEFAULT CURRENT_TIMESTAMP,
    data_processo TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  );`,

  // 16. financeiro
  `CREATE TABLE IF NOT EXISTS financeiro (
    id_financeiro INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venda_balcao INTEGER NULL,
    id_venda_checkin INTEGER NULL,
    id_pagamento_chekin INTEGER NULL,
    total_dia REAL DEFAULT 0.0,
    total_semana REAL DEFAULT 0.0,
    total_mes REAL DEFAULT 0.0,
    total_ano REAL DEFAULT 0.0,
    entradas REAL DEFAULT 0.0,
    saidas REAL DEFAULT 0.0,
    ganhos REAL DEFAULT 0.0,
    perdas REAL DEFAULT 0.0,
    progecao REAL DEFAULT 0.0,
    FOREIGN KEY (id_venda_balcao) REFERENCES venda_balcao(id_venda_balcao),
    FOREIGN KEY (id_venda_checkin) REFERENCES consumo_checkin(id_venda_checkin),
    FOREIGN KEY (id_pagamento_chekin) REFERENCES pagamento_chekin(id_pagamento_chekin)
  );`
];

// SCHEMA completo consolidado
export const SCHEMA = TABLES.join('\n\n');

export function inicializarBanco(db: { exec: (sql: string) => any }): void {
  // Ativa chaves estrangeiras
  db.exec(PRAGMA_FOREIGN_KEYS);
  
  // Executa o schema completo
  db.exec(SCHEMA);
}
