/**
 * hostelGerente - Processo Principal do Electron
 * Caminho: src/main.ts
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

// Importa lógicas de banco
import { inicializarBanco } from './database/banco';
import { gerarHashSenha } from './app/config/criptografia';

// Importa controladores de Hóspede
import { cadastrarHospede } from './app/hospede/cadastro_hospede';
import { listarHospedes, atualizarHospede } from './app/hospede/update_hospede';
import { deletarHospede } from './app/hospede/deleta_hospede';

// Importa controladores de Usuário
import { cadastrarUsuario } from './app/usuario/cadastro_usuario';
import { listarUsuarios, atualizarUsuario } from './app/usuario/update_usuario';
import { deletarUsuario } from './app/usuario/deleta_usuario';

// Importa controladores de Quarto
import { cadastrarQuarto } from './app/quarto/cadastro_quarto';
import { deletarQuarto } from './app/quarto/deleta_quarto';
import { listarQuartos, atualizarQuarto } from './app/quarto/update_quarto';

// Importa controlador de Login
import { efetuarLogin } from './app/login/gerencia_login';

// Importa controladores de Check-in
import { cadastrarCheckin } from './app/checkin/cadastro_checkin';
import { listarCheckins, encerrarCheckin, deletarCheckin } from './app/checkin/update_checkin';

let mainWindow: BrowserWindow | null = null;
let db: DatabaseSync | null = null;


// Resolve caminhos
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const dbDir = path.join(app.getPath('userData'), 'database');
const dbPath = path.join(dbDir, 'hostel_gerente.sqlite');

/**
 * Inicializa a conexão com o banco de dados e aplica o esquema se necessário.
 */
function initDatabase() {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    console.log(`Conectando ao banco SQLite em: ${dbPath}`);
    db = new DatabaseSync(dbPath);

    // Ativa chaves estrangeiras e cria as tabelas do esquema
    db.exec('PRAGMA foreign_keys = ON;');
    
    // Lê e aplica as tabelas
    inicializarBanco(db);
    console.log('Banco de dados carregado e verificado.');

    // Cria o usuário administrador padrão caso não exista nenhum
    const checkAdmin = db.prepare("SELECT id_usuario FROM usuario WHERE cpf = '00000000000'");
    const adminExists = checkAdmin.get();

    if (!adminExists) {
      console.log('Criando usuário administrador inicial (GERENTE / gerente123)...');
      db.exec('BEGIN TRANSACTION;');
      try {
        const insertUser = db.prepare(`
          INSERT INTO usuario (nome_completo, rg, cpf, data_nascimento, telefone, email)
          VALUES ('GERENTE ADMINISTRADOR', '00.000.000-0', '00000000000', '1990-01-01', '(00) 00000-0000', 'admin@hostel.com')
        `);
        const resUser = insertUser.run();
        const userId = resUser.lastInsertRowid;

        const hash = gerarHashSenha('gerente123');
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

        db.exec('COMMIT;');
        console.log('Usuário administrador inicial criado.');
      } catch (err) {
        db.exec('ROLLBACK;');
        console.error('Erro ao criar admin inicial:', err);
      }
    }
  } catch (err) {
    console.error('Falha ao inicializar o banco de dados:', err);
  }
}

/**
 * Cria a janela principal do aplicativo desktop.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remove menu padrão na versão de produção para visual limpo
  if (!isDev) {
    mainWindow.setMenu(null);
  }

  // Carrega URL do Vite no modo dev, ou index.html na build
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Configura pontes IPC vinculando a interface Vue com o backend
function setupIpcHandlers() {
  // Autenticação
  ipcMain.handle('login:efetuar', async (_, input) => {
    return efetuarLogin(db, input);
  });

  // Hóspedes
  ipcMain.handle('hospede:cadastrar', async (_, input) => {
    return cadastrarHospede(db, input);
  });
  ipcMain.handle('hospede:listar', async (_) => {
    return listarHospedes(db);
  });
  ipcMain.handle('hospede:atualizar', async (_, input) => {
    return atualizarHospede(db, input);
  });
  ipcMain.handle('hospede:deletar', async (_, id) => {
    return deletarHospede(db, id);
  });

  // Usuários
  ipcMain.handle('usuario:cadastrar', async (_, input) => {
    return cadastrarUsuario(db, input);
  });
  ipcMain.handle('usuario:listar', async (_) => {
    return listarUsuarios(db);
  });
  ipcMain.handle('usuario:atualizar', async (_, input) => {
    return atualizarUsuario(db, input);
  });
  ipcMain.handle('usuario:deletar', async (_, id) => {
    return deletarUsuario(db, id);
  });

  // Quartos
  ipcMain.handle('quarto:cadastrar', async (_, input) => {
    return cadastrarQuarto(db, input);
  });
  ipcMain.handle('quarto:listar', async (_) => {
    return listarQuartos(db);
  });
  ipcMain.handle('quarto:atualizar', async (_, input) => {
    return atualizarQuarto(db, input);
  });
  ipcMain.handle('quarto:deletar', async (_, id) => {
    return deletarQuarto(db, id);
  });

  // Check-ins
  ipcMain.handle('checkin:cadastrar', async (_, input) => {
    return cadastrarCheckin(db, input);
  });
  ipcMain.handle('checkin:listar', async (_) => {
    return listarCheckins(db);
  });
  ipcMain.handle('checkin:atualizar', async (_, id) => {
    return encerrarCheckin(db, id);
  });
  ipcMain.handle('checkin:deletar', async (_, id) => {
    return deletarCheckin(db, id);
  });
}

// Ciclo de vida do Electron
app.whenReady().then(() => {
  initDatabase();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
