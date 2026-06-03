"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const node_sqlite = require("node:sqlite");
const crypto = require("crypto");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const crypto__namespace = /* @__PURE__ */ _interopNamespaceDefault(crypto);
const PRAGMA_FOREIGN_KEYS = "PRAGMA foreign_keys = ON;";
const TABLES = [
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
const SCHEMA = TABLES.join("\n\n");
function inicializarBanco(db2) {
  db2.exec(PRAGMA_FOREIGN_KEYS);
  db2.exec(SCHEMA);
}
function gerarHashSenha(senha) {
  const salt = crypto__namespace.randomBytes(16).toString("hex");
  const hash = crypto__namespace.scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function compararSenha(senha, hashSalvo) {
  try {
    const parts = hashSalvo.split(":");
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const hashComparar = crypto__namespace.scryptSync(senha, salt, 64).toString("hex");
    return crypto__namespace.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(hashComparar, "hex")
    );
  } catch (error) {
    return false;
  }
}
function validarCPF(cpf) {
  const cleanCPF = cpf.replace(/[^\d]/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let resto = soma * 10 % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCPF.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  resto = soma * 10 % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCPF.charAt(10))) return false;
  return true;
}
function validarCNPJ(cnpj) {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "");
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  return true;
}
function cadastrarHospede(db2, input) {
  try {
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim() : null;
    if (input.tipo === "PF") {
      const nomeCompleto = input.nome_completo.toUpperCase().trim();
      const rg = input.rg ? input.rg.trim() : null;
      const cpf = input.cpf.replace(/[^\d]/g, "");
      if (!validarCPF(cpf)) {
        return { success: false, message: "CPF inválido matematicamente." };
      }
      if (!nomeCompleto) {
        return { success: false, message: "O nome completo é obrigatório." };
      }
      const checkStmt = db2.prepare("SELECT id_hospede_pf FROM hospede_cpf WHERE cpf = ?");
      const existing = checkStmt.get(cpf);
      if (existing) {
        return { success: false, message: "Hóspede já cadastrado com este CPF." };
      }
      db2.exec("BEGIN TRANSACTION;");
      try {
        const insertPF = db2.prepare(`
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
        const insertHospede = db2.prepare(`
          INSERT INTO hospedes (id_hospede_pf, id_hospede_pj)
          VALUES (?, NULL)
        `);
        const resultHospede = insertHospede.run(idHospedePf);
        const idHospedes = resultHospede.lastInsertRowid;
        db2.exec("COMMIT;");
        return {
          success: true,
          message: "Hóspede Pessoa Física cadastrado com sucesso!",
          data: { id_hospedes: idHospedes, id_hospede_pf: idHospedePf }
        };
      } catch (err) {
        db2.exec("ROLLBACK;");
        throw err;
      }
    } else if (input.tipo === "PJ") {
      const razaoSocial = input.razao_social.toUpperCase().trim();
      const nomeFantasia = input.nome_fantasia ? input.nome_fantasia.toUpperCase().trim() : null;
      const cnpj = input.cnpj.replace(/[^\d]/g, "");
      if (!validarCNPJ(cnpj)) {
        return { success: false, message: "CNPJ inválido." };
      }
      if (!razaoSocial) {
        return { success: false, message: "A Razão Social é obrigatória." };
      }
      const checkStmt = db2.prepare("SELECT id_hospede_pj FROM hospede_pj WHERE cnpj = ?");
      const existing = checkStmt.get(cnpj);
      if (existing) {
        return { success: false, message: "Empresa já cadastrada com este CNPJ." };
      }
      db2.exec("BEGIN TRANSACTION;");
      try {
        const insertPJ = db2.prepare(`
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
        const insertHospede = db2.prepare(`
          INSERT INTO hospedes (id_hospede_pf, id_hospede_pj)
          VALUES (NULL, ?)
        `);
        const resultHospede = insertHospede.run(idHospedePj);
        const idHospedes = resultHospede.lastInsertRowid;
        db2.exec("COMMIT;");
        return {
          success: true,
          message: "Hóspede Pessoa Jurídica cadastrado com sucesso!",
          data: { id_hospedes: idHospedes, id_hospede_pj: idHospedePj }
        };
      } catch (err) {
        db2.exec("ROLLBACK;");
        throw err;
      }
    } else {
      return { success: false, message: "Tipo de hóspede inválido." };
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro interno ao cadastrar hóspede: ${error.message || error}`
    };
  }
}
function listarHospedes(db2) {
  try {
    const stmt = db2.prepare(`
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
    return stmt.all ? stmt.all() : stmt.allObjects ? stmt.allObjects() : [];
  } catch (error) {
    console.error("Erro ao listar hóspedes:", error);
    return [];
  }
}
function atualizarHospede(db2, input) {
  try {
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim() : null;
    if (input.tipo === "PF") {
      const nomeCompleto = input.nome_completo ? input.nome_completo.toUpperCase().trim() : "";
      const rg = input.rg ? input.rg.trim() : null;
      const cpf = input.cpf ? input.cpf.replace(/[^\d]/g, "") : "";
      if (!nomeCompleto) {
        return { success: false, message: "O nome completo é obrigatório." };
      }
      if (!cpf || !validarCPF(cpf)) {
        return { success: false, message: "CPF inválido." };
      }
      const checkStmt = db2.prepare("SELECT id_hospede_pf FROM hospede_cpf WHERE cpf = ? AND id_hospede_pf <> ?");
      const existing = checkStmt.get(cpf, input.id_tipo);
      if (existing) {
        return { success: false, message: "Outro hóspede já possui este CPF cadastrado." };
      }
      const updatePF = db2.prepare(`
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
      return { success: true, message: "Hóspede Pessoa Física atualizado com sucesso!" };
    } else if (input.tipo === "PJ") {
      const razaoSocial = input.razao_social ? input.razao_social.toUpperCase().trim() : "";
      const nomeFantasia = input.nome_fantasia ? input.nome_fantasia.toUpperCase().trim() : null;
      const cnpj = input.cnpj ? input.cnpj.replace(/[^\d]/g, "") : "";
      if (!razaoSocial) {
        return { success: false, message: "A Razão Social é obrigatória." };
      }
      if (!cnpj || !validarCNPJ(cnpj)) {
        return { success: false, message: "CNPJ inválido." };
      }
      const checkStmt = db2.prepare("SELECT id_hospede_pj FROM hospede_pj WHERE cnpj = ? AND id_hospede_pj <> ?");
      const existing = checkStmt.get(cnpj, input.id_tipo);
      if (existing) {
        return { success: false, message: "Outra empresa já possui este CNPJ cadastrado." };
      }
      const updatePJ = db2.prepare(`
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
      return { success: true, message: "Hóspede Pessoa Jurídica atualizado com sucesso!" };
    }
    return { success: false, message: "Tipo de hóspede inválido." };
  } catch (error) {
    return {
      success: false,
      message: `Erro interno ao atualizar hóspede: ${error.message || error}`
    };
  }
}
function deletarHospede(db2, idHospedes) {
  try {
    const findStmt = db2.prepare(`
      SELECT id_hospede_pf, id_hospede_pj 
      FROM hospedes 
      WHERE id_hospedes = ?
    `);
    const hospede = findStmt.get(idHospedes);
    if (!hospede) {
      return { success: false, message: "Hóspede não encontrado." };
    }
    const { id_hospede_pf, id_hospede_pj } = hospede;
    db2.exec("BEGIN TRANSACTION;");
    try {
      if (id_hospede_pf !== null) {
        const deletePF = db2.prepare("DELETE FROM hospede_cpf WHERE id_hospede_pf = ?");
        deletePF.run(id_hospede_pf);
      }
      if (id_hospede_pj !== null) {
        const deletePJ = db2.prepare("DELETE FROM hospede_pj WHERE id_hospede_pj = ?");
        deletePJ.run(id_hospede_pj);
      }
      const deleteHospedes = db2.prepare("DELETE FROM hospedes WHERE id_hospedes = ?");
      deleteHospedes.run(idHospedes);
      db2.exec("COMMIT;");
      return { success: true, message: "Hóspede removido com sucesso!" };
    } catch (err) {
      db2.exec("ROLLBACK;");
      throw err;
    }
  } catch (error) {
    console.error("Erro ao excluir hóspede:", error);
    return {
      success: false,
      message: `Erro interno ao excluir hóspede: ${error.message || error}`
    };
  }
}
function cadastrarUsuario(db2, input) {
  try {
    const nomeCompleto = input.nome_completo.toUpperCase().trim();
    const rg = input.rg ? input.rg.trim() : null;
    const cpf = input.cpf.replace(/[^\d]/g, "");
    const nomeUsuario = input.nome_usuario.toUpperCase().trim();
    const senha = input.senha;
    const nivel = input.nivel;
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim() : null;
    if (!nomeCompleto) {
      return { success: false, message: "O nome completo é obrigatório." };
    }
    if (!validarCPF(cpf)) {
      return { success: false, message: "CPF inválido matematicamente." };
    }
    if (!nomeUsuario) {
      return { success: false, message: "O Nome de Usuário é obrigatório." };
    }
    if (!senha || senha.length < 6) {
      return { success: false, message: "A senha deve conter no mínimo 6 caracteres." };
    }
    if (nivel !== "admin" && nivel !== "padrao") {
      return { success: false, message: "Nível de acesso inválido." };
    }
    const checkCpfStmt = db2.prepare("SELECT id_usuario FROM usuario WHERE cpf = ?");
    const existingCpf = checkCpfStmt.get(cpf);
    if (existingCpf) {
      return { success: false, message: "Já existe um funcionário cadastrado com este CPF." };
    }
    const checkUserStmt = db2.prepare("SELECT id_login FROM login WHERE nome_usuario = ?");
    const existingUser = checkUserStmt.get(nomeUsuario);
    if (existingUser) {
      return { success: false, message: "Nome de Usuário (Username) já está em uso." };
    }
    db2.exec("BEGIN TRANSACTION;");
    try {
      const insertUsuario = db2.prepare(`
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
      const hashSenha = gerarHashSenha(senha);
      const insertLogin = db2.prepare(`
        INSERT INTO login (id_usuario, nome_usuario, senha)
        VALUES (?, ?, ?)
      `);
      const resultLogin = insertLogin.run(idUsuario, nomeUsuario, hashSenha);
      const idLogin = resultLogin.lastInsertRowid;
      const insertNivel = db2.prepare(`
        INSERT INTO nivel_acesso (id_login, id_usuario, nivel)
        VALUES (?, ?, ?)
      `);
      insertNivel.run(idLogin, idUsuario, nivel);
      db2.exec("COMMIT;");
      return {
        success: true,
        message: "Funcionário cadastrado com sucesso!",
        data: { id_usuario: idUsuario, id_login: idLogin }
      };
    } catch (err) {
      db2.exec("ROLLBACK;");
      throw err;
    }
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return {
      success: false,
      message: `Erro interno ao cadastrar funcionário: ${error.message || error}`
    };
  }
}
function listarUsuarios(db2) {
  try {
    const stmt = db2.prepare(`
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
    return stmt.all ? stmt.all() : stmt.allObjects ? stmt.allObjects() : [];
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return [];
  }
}
function atualizarUsuario(db2, input) {
  try {
    const nomeCompleto = input.nome_completo.toUpperCase().trim();
    const rg = input.rg ? input.rg.trim() : null;
    const cpf = input.cpf.replace(/[^\d]/g, "");
    const nomeUsuario = input.nome_usuario.toUpperCase().trim();
    const nivel = input.nivel;
    const telefone = input.telefone ? input.telefone.trim() : null;
    const email = input.email ? input.email.trim() : null;
    if (!nomeCompleto) {
      return { success: false, message: "O nome completo é obrigatório." };
    }
    if (!validarCPF(cpf)) {
      return { success: false, message: "CPF inválido matematicamente." };
    }
    if (!nomeUsuario) {
      return { success: false, message: "O Nome de Usuário é obrigatório." };
    }
    const checkCpf = db2.prepare("SELECT id_usuario FROM usuario WHERE cpf = ? AND id_usuario <> ?");
    const existingCpf = checkCpf.get(cpf, input.id_usuario);
    if (existingCpf) {
      return { success: false, message: "Outro funcionário já está cadastrado com este CPF." };
    }
    const checkUser = db2.prepare("SELECT id_login FROM login WHERE nome_usuario = ? AND id_login <> ?");
    const existingUser = checkUser.get(nomeUsuario, input.id_login);
    if (existingUser) {
      return { success: false, message: "Nome de Usuário (Username) já está em uso." };
    }
    db2.exec("BEGIN TRANSACTION;");
    try {
      const updateUsuario = db2.prepare(`
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
      if (input.senha && input.senha.trim() !== "") {
        const senha = input.senha.trim();
        if (senha.length < 6) {
          throw new Error("A nova senha deve conter no mínimo 6 caracteres.");
        }
        const hashSenha = gerarHashSenha(senha);
        const updateLoginWithPass = db2.prepare(`
          UPDATE login
          SET nome_usuario = ?, senha = ?
          WHERE id_login = ?
        `);
        updateLoginWithPass.run(nomeUsuario, hashSenha, input.id_login);
      } else {
        const updateLogin = db2.prepare(`
          UPDATE login
          SET nome_usuario = ?
          WHERE id_login = ?
        `);
        updateLogin.run(nomeUsuario, input.id_login);
      }
      const updateNivel = db2.prepare(`
        UPDATE nivel_acesso
        SET nivel = ?
        WHERE id_usuario = ? AND id_login = ?
      `);
      updateNivel.run(nivel, input.id_usuario, input.id_login);
      db2.exec("COMMIT;");
      return { success: true, message: "Cadastro do funcionário atualizado com sucesso!" };
    } catch (err) {
      db2.exec("ROLLBACK;");
      return { success: false, message: err.message || "Erro durante a atualização no banco de dados." };
    }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return {
      success: false,
      message: `Erro interno ao atualizar funcionário: ${error.message || error}`
    };
  }
}
function deletarUsuario(db2, idUsuario) {
  try {
    const deleteStmt = db2.prepare("DELETE FROM usuario WHERE id_usuario = ?");
    const result = deleteStmt.run(idUsuario);
    if (result.changes === 0) {
      return { success: false, message: "Usuário não encontrado." };
    }
    return { success: true, message: "Funcionário excluído com sucesso!" };
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return {
      success: false,
      message: `Erro interno ao excluir funcionário: ${error.message || error}`
    };
  }
}
function efetuarLogin(db2, input) {
  try {
    const nomeUsuario = input.nome_usuario.toUpperCase().trim();
    const senha = input.senha;
    if (!nomeUsuario || !senha) {
      return { success: false, message: "Nome de usuário e senha são obrigatórios." };
    }
    const findLoginStmt = db2.prepare(`
      SELECT id_login, id_usuario, senha 
      FROM login 
      WHERE nome_usuario = ?
    `);
    const credenciais = findLoginStmt.get(nomeUsuario);
    if (!credenciais) {
      return { success: false, message: "Usuário ou senha incorretos." };
    }
    const match = compararSenha(senha, credenciais.senha);
    if (!match) {
      return { success: false, message: "Usuário ou senha incorretos." };
    }
    const findUserStmt = db2.prepare(`
      SELECT u.id_usuario, u.nome_completo, n.nivel
      FROM usuario u
      LEFT JOIN nivel_acesso n ON u.id_usuario = n.id_usuario
      WHERE u.id_usuario = ?
    `);
    const usuarioInfo = findUserStmt.get(credenciais.id_usuario);
    if (!usuarioInfo) {
      return { success: false, message: "Dados cadastrais do usuário não encontrados." };
    }
    return {
      success: true,
      message: "Autenticação realizada com sucesso!",
      usuario: {
        id_usuario: usuarioInfo.id_usuario,
        nome_completo: usuarioInfo.nome_completo,
        nome_usuario: nomeUsuario,
        nivel: usuarioInfo.nivel || "padrao"
      }
    };
  } catch (error) {
    console.error("Erro ao efetuar login:", error);
    return {
      success: false,
      message: `Erro interno no servidor de autenticação: ${error.message || error}`
    };
  }
}
let mainWindow = null;
let db = null;
const isDev = process.env.NODE_ENV === "development" || !electron.app.isPackaged;
const dbDir = path__namespace.join(electron.app.getPath("userData"), "database");
const dbPath = path__namespace.join(dbDir, "hostel_gerente.sqlite");
function initDatabase() {
  try {
    if (!fs__namespace.existsSync(dbDir)) {
      fs__namespace.mkdirSync(dbDir, { recursive: true });
    }
    console.log(`Conectando ao banco SQLite em: ${dbPath}`);
    db = new node_sqlite.DatabaseSync(dbPath);
    db.exec("PRAGMA foreign_keys = ON;");
    inicializarBanco(db);
    console.log("Banco de dados carregado e verificado.");
    const checkAdmin = db.prepare("SELECT id_usuario FROM usuario WHERE cpf = '00000000000'");
    const adminExists = checkAdmin.get();
    if (!adminExists) {
      console.log("Criando usuário administrador inicial (GERENTE / gerente123)...");
      db.exec("BEGIN TRANSACTION;");
      try {
        const insertUser = db.prepare(`
          INSERT INTO usuario (nome_completo, rg, cpf, data_nascimento, telefone, email)
          VALUES ('GERENTE ADMINISTRADOR', '00.000.000-0', '00000000000', '1990-01-01', '(00) 00000-0000', 'admin@hostel.com')
        `);
        const resUser = insertUser.run();
        const userId = resUser.lastInsertRowid;
        const hash = gerarHashSenha("gerente123");
        const insertLogin = db.prepare(`
          INSERT INTO login (id_usuario, nome_usuario, senha)
          VALUES (?, 'GERENTE', ?)
        `);
        const resLogin = insertLogin.run(userId, hash);
        const loginId = resLogin.lastInsertRowid;
        const insertNivel = db.prepare(`
          INSERT INTO nivel_acesso (id_login, id_usuario, nivel)
          VALUES (?, ?, 'admin')
        `);
        insertNivel.run(loginId, userId);
        db.exec("COMMIT;");
        console.log("Usuário administrador inicial criado.");
      } catch (err) {
        db.exec("ROLLBACK;");
        console.error("Erro ao criar admin inicial:", err);
      }
    }
  } catch (err) {
    console.error("Falha ao inicializar o banco de dados:", err);
  }
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path__namespace.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (!isDev) {
    mainWindow.setMenu(null);
  }
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path__namespace.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function setupIpcHandlers() {
  electron.ipcMain.handle("login:efetuar", async (_, input) => {
    return efetuarLogin(db, input);
  });
  electron.ipcMain.handle("hospede:cadastrar", async (_, input) => {
    return cadastrarHospede(db, input);
  });
  electron.ipcMain.handle("hospede:listar", async (_) => {
    return listarHospedes(db);
  });
  electron.ipcMain.handle("hospede:atualizar", async (_, input) => {
    return atualizarHospede(db, input);
  });
  electron.ipcMain.handle("hospede:deletar", async (_, id) => {
    return deletarHospede(db, id);
  });
  electron.ipcMain.handle("usuario:cadastrar", async (_, input) => {
    return cadastrarUsuario(db, input);
  });
  electron.ipcMain.handle("usuario:listar", async (_) => {
    return listarUsuarios(db);
  });
  electron.ipcMain.handle("usuario:atualizar", async (_, input) => {
    return atualizarUsuario(db, input);
  });
  electron.ipcMain.handle("usuario:deletar", async (_, id) => {
    return deletarUsuario(db, id);
  });
}
electron.app.whenReady().then(() => {
  initDatabase();
  setupIpcHandlers();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
