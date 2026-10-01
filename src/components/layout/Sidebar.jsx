// components/layout/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Truck, 
  Building,
  Shield,
  Scale,
  FileCheck,
  Award,
  Printer,
  ChevronDown,
  ChevronRight,
  User,
  Pill,
  ShoppingCart,
  Users,
  Package,
  ClipboardList,
  Box,
  Tag,
  PlusCircle,
  History,
  UserCog,
  DollarSign,
  AlertCircle,
  Layers
} from 'lucide-react';
import { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext'; // Comentado - aguardando back

export const Sidebar = () => {
  // const { isGestor } = useAuth(); // Comentado - aguardando back
  const location = useLocation();
  
  // Estado para controlar múltiplos dropdowns independentes
  const [openMenus, setOpenMenus] = useState({
    produtos: false,
    vendas: false,
    compras: false,
    movimentacoes: false
  });

  // Verifica se um submenu está ativo
  const isSubmenuActive = (submenuItems) => {
    return submenuItems.some(item => location.pathname === item.href);
  };

  // Abre automaticamente menus com subitem ativo
  useEffect(() => {
    const newOpenMenus = { ...openMenus };
    let hasChanges = false;

    // Verifica cada menu
    Object.keys(newOpenMenus).forEach(menuKey => {
      const menuItem = navigation.find(item => 
        item.type === 'dropdown' && item.key === menuKey
      );
      
      if (menuItem && menuItem.submenu) {
        if (isSubmenuActive(menuItem.submenu)) {
          if (!newOpenMenus[menuKey]) {
            newOpenMenus[menuKey] = true;
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      setOpenMenus(newOpenMenus);
    }
  }, [location.pathname]);

  // Alterna menu dropdown específico
  const toggleMenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Submenu de Produtos
  const produtosSubmenu = [
    { 
      name: 'Lista de Produtos', 
      href: '/produto', 
      icon: Pill,
      descricao: 'Visualizar todos os medicamentos'
    },
    { 
      name: 'Categorias', 
      href: '/categorias', 
      icon: Tag,
      descricao: 'Gerenciar categorias'
    },
    { 
      name: 'Lotes', 
      href: '/lote/prod', 
      icon: Box,
      descricao: 'Gerenciar lotes por validade'
    },
    { 
      name: 'Stock Baixo', 
      href: '/dashboard', 
      icon: AlertCircle,
      descricao: 'Produtos com estoque crítico'
    },
  ];

  // Submenu de Vendas
  const vendasSubmenu = [
    { 
      name: 'Nova Venda', 
      href: '/vendas/nova', 
      icon: PlusCircle,
      descricao: 'Realizar nova venda'
    },
    { 
      name: 'Histórico de Vendas', 
      href: '/Historico', 
      icon: History,
      descricao: 'Consultar vendas realizadas'
    },
  ];

  // Submenu de Compras
  const comprasSubmenu = [
    { 
      name: 'Nova Compra', 
      href: '/compras/nova', 
      icon: PlusCircle,
      descricao: 'Registrar nova compra'
    },
    { 
      name: 'Histórico de Compras', 
      href: '/compras', 
      icon: History,
      descricao: 'Consultar compras realizadas'
    },
    { 
      name: 'Fornecedores', 
      href: '/fornecedores', 
      icon: Truck,
      descricao: 'Gerenciar fornecedores'
    },
  ];

  // Submenu de Movimentações
  const movimentacoesSubmenu = [
    { 
      name: 'Movimentações de Stock', 
      href: '/movimentacoes', 
      icon: ClipboardList,
      descricao: 'Histórico de movimentações'
    },
  ];

  // Navegação principal com keys únicas
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home,
      key: 'dashboard'
    },
    { 
      name: 'Produtos',
      icon: Package,
      type: 'dropdown',
      key: 'produtos',
      submenu: produtosSubmenu
    },
    { 
      name: 'Vendas',
      icon: ShoppingCart,
      type: 'dropdown',
      key: 'vendas',
      submenu: vendasSubmenu
    },
    { 
      name: 'Clientes', 
      href: '/dashboard', 
      icon: Users,
      key: 'clientes'
    },
    { 
      name: 'Compras',
      icon: Layers,
      type: 'dropdown',
      key: 'compras',
      submenu: comprasSubmenu
    },
    { 
      name: 'Movimentações',
      icon: ClipboardList,
      type: 'dropdown',
      key: 'movimentacoes',
      submenu: movimentacoesSubmenu
    },
    { 
      name: 'Utilizadores', 
      href: '/utilizador', 
      icon: UserCog,
      key: 'utilizadores'
    },
    { 
      name: 'Meu Perfil', 
      href: '/perfil', 
      icon: User,
      key: 'perfil'
    },
  ];

  return (
    <div className="w-64 bg-gray-800 min-h-screen flex-shrink-0">
      <div className="flex flex-col h-full">
        {/* Header - Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SGF</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">Sistema Gestão</h1>
              <p className="text-gray-400 text-xs">Farmácia</p>
            </div>
          </div>
        </div>

        {/* Info do Usuário */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="bg-gray-700 rounded-lg p-2">
            <p className="text-xs text-gray-400">Acesso:</p>
            <p className="text-sm font-medium text-white flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              SGF
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            // Dropdown
            if (item.type === 'dropdown') {
              const isOpen = openMenus[item.key] || false;
              const hasActiveSubmenu = isSubmenuActive(item.submenu || []);

              return (
                <div key={item.key} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 
                      text-sm font-medium rounded-md transition-all duration-200
                      ${isOpen || hasActiveSubmenu 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Submenu com animação */}
                  <div
                    className={`
                      ml-4 pl-4 border-l border-gray-600 space-y-1
                      transition-all duration-300 ease-in-out
                      ${isOpen ? 'max-h-96 opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}
                    `}
                  >
                    {item.submenu.map((subItem) => {
                      const Icon = subItem.icon;
                      return (
                        <NavLink
                          key={subItem.name}
                          to={subItem.href}
                          className={({ isActive }) =>
                            `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                              isActive
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                          }
                          title={subItem.descricao}
                        >
                          <Icon className="mr-3 flex-shrink-0 h-4 w-4" />
                          <span className="flex-1">{subItem.name}</span>
                          {subItem.descricao && (
                            <span className="text-xs text-gray-500 group-hover:text-gray-300 truncate max-w-[80px] hidden lg:block">
                              {subItem.descricao}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Item normal
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            <p>v1.0.0</p>
            <p className="text-gray-600">© 2024 SGF</p>
          </div>
        </div>
      </div>
    </div>
  );
};