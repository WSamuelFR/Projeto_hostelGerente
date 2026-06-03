/**
 * hostelGerente - Electron Preload Script (Ponte de Segurança)
 * Caminho: src/preload.ts
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expõe canais IPC seguros para a janela do Renderer Vue
contextBridge.exposeInMainWorld('api', {
  // Autenticação
  efetuarLogin: (input: any) => ipcRenderer.invoke('login:efetuar', input),

  // Cadastro e Gerenciamento de Hóspedes
  cadastrarHospede: (input: any) => ipcRenderer.invoke('hospede:cadastrar', input),
  listarHospedes: () => ipcRenderer.invoke('hospede:listar'),
  atualizarHospede: (input: any) => ipcRenderer.invoke('hospede:atualizar', input),
  deletarHospede: (id: number) => ipcRenderer.invoke('hospede:deletar', id),

  // Cadastro e Gerenciamento de Usuários (Funcionários)
  cadastrarUsuario: (input: any) => ipcRenderer.invoke('usuario:cadastrar', input),
  listarUsuarios: () => ipcRenderer.invoke('usuario:listar'),
  atualizarUsuario: (input: any) => ipcRenderer.invoke('usuario:atualizar', input),
  deletarUsuario: (id: number) => ipcRenderer.invoke('usuario:deletar', id),

  // Cadastro e Gerenciamento de Quartos
  cadastrarQuarto: (input: any) => ipcRenderer.invoke('quarto:cadastrar', input),
  listarQuartos: () => ipcRenderer.invoke('quarto:listar'),
  atualizarQuarto: (input: any) => ipcRenderer.invoke('quarto:atualizar', input),
  deletarQuarto: (id: number) => ipcRenderer.invoke('quarto:deletar', id),

  // Cadastro e Gerenciamento de Check-ins
  cadastrarCheckin: (input: any) => ipcRenderer.invoke('checkin:cadastrar', input),
  listarCheckins: () => ipcRenderer.invoke('checkin:listar'),
  encerrarCheckin: (id: number) => ipcRenderer.invoke('checkin:atualizar', id),
  deletarCheckin: (id: number) => ipcRenderer.invoke('checkin:deletar', id),
});
