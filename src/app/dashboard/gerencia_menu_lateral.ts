/**
 * hostelGerente - Lógica e Configuração do Menu Lateral
 * Caminho: src/app/dashboard/gerencia_menu_lateral.ts
 */

export interface MenuLateralItem {
  id: 'DASHBOARD' | 'CADASTRO_HOSPEDE' | 'CADASTRO_USUARIO' | 'CADASTRO_QUARTO' | 'CADASTRO_CHECKIN';
  label: string;
  icon: string;
  perfisAutorizados: ('admin' | 'padrao')[];
}

// Lista estática de itens do menu lateral
export const MENU_ITEMS: MenuLateralItem[] = [
  {
    id: 'DASHBOARD',
    label: 'Dashboard',
    icon: 'bi-grid-1x2-fill',
    perfisAutorizados: ['admin', 'padrao']
  },
  {
    id: 'CADASTRO_HOSPEDE',
    label: 'Cadastrar Hóspede',
    icon: 'bi-person-plus-fill',
    perfisAutorizados: ['admin', 'padrao']
  },
  {
    id: 'CADASTRO_USUARIO',
    label: 'Cadastrar Usuário',
    icon: 'bi-person-badge-fill',
    perfisAutorizados: ['admin'] // Apenas administradores podem cadastrar outros usuários
  },
  {
    id: 'CADASTRO_QUARTO',
    label: 'Cadastrar Quarto',
    icon: 'bi-door-open-fill',
    perfisAutorizados: ['admin', 'padrao']
  },
  {
    id: 'CADASTRO_CHECKIN',
    label: 'Registrar Check-in',
    icon: 'bi-box-arrow-in-right',
    perfisAutorizados: ['admin', 'padrao']
  }
];

/**
 * Filtra e retorna os itens do menu lateral autorizados para o perfil do usuário logado.
 */
export function obterItensMenu(nivelUsuario: 'admin' | 'padrao'): MenuLateralItem[] {
  return MENU_ITEMS.filter(item => item.perfisAutorizados.includes(nivelUsuario));
}
