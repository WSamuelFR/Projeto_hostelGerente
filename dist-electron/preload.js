"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // Autenticação
  efetuarLogin: (input) => electron.ipcRenderer.invoke("login:efetuar", input),
  // Cadastro e Gerenciamento de Hóspedes
  cadastrarHospede: (input) => electron.ipcRenderer.invoke("hospede:cadastrar", input),
  listarHospedes: () => electron.ipcRenderer.invoke("hospede:listar"),
  atualizarHospede: (input) => electron.ipcRenderer.invoke("hospede:atualizar", input),
  deletarHospede: (id) => electron.ipcRenderer.invoke("hospede:deletar", id),
  // Cadastro e Gerenciamento de Usuários (Funcionários)
  cadastrarUsuario: (input) => electron.ipcRenderer.invoke("usuario:cadastrar", input),
  listarUsuarios: () => electron.ipcRenderer.invoke("usuario:listar"),
  atualizarUsuario: (input) => electron.ipcRenderer.invoke("usuario:atualizar", input),
  deletarUsuario: (id) => electron.ipcRenderer.invoke("usuario:deletar", id)
});
