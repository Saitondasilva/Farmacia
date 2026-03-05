import { NavLink } from 'react-router-dom';
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
  User
} from 'lucide-react';
import { useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext'; // Comentado - aguardando back

export const Sidebar = () => {
  // const { isGestor } = useAuth(); // Comentado - aguardando back
  const [instituicoesOpen, setInstituicoesOpen] = useState(false);

  // TODAS as instituições disponíveis - acesso total por enquanto
  const instituicoes = [
    { 
      name: 'Ministério Público', 
      href: '/ministerio-publico', 
      icon: Shield,
      descricao: 'Análise inicial de processos'
    },
    { 
      name: 'Ministra da Justiça', 
      href: '/ministra-justica', 
      icon: Scale,
      descricao: 'Encaminhamento de processos'
    },
    { 
      name: 'Conselho de Ministros', 
      href: '/conselho-ministro', 
      icon: FileCheck,
      descricao: 'Análise e relatórios'
    },
    { 
      name: 'Presidência', 
      href: '/presidencia', 
      icon: Award,
      descricao: 'Promulgação de processos'
    },
    { 
      name: 'Repografia', 
      href: '/repografia', 
      icon: Printer,
      descricao: 'Impressão e registro'
    },
  ];

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Ver Investidores', href: '/ver-investidores', icon: Truck },
    
    // Menu dropdown de Instituições - TODAS visíveis por enquanto
    {
      name: 'Instituições',
      icon: Building,
      type: 'dropdown',
      submenu: instituicoes // TODAS as instituições, sem filtro
    },
    
    { name: 'Meu Perfil', href: '/perfil', icon: User },
  ];

  return (
    <div className="w-64 bg-gray-800 min-h-screen">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Header com info - UCID é o gestor master */}
          <div className="px-4 mb-4">
            <div className="bg-gray-700 rounded-lg p-2">
              <p className="text-xs text-gray-300">Acesso:</p>
              <p className="text-sm font-medium text-white flex items-center">
                <span className="mr-1"></span> UCID 
              </p>
            </div>
          </div>

          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              // Dropdown de Instituições
              if (item.type === 'dropdown') {
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => setInstituicoesOpen(!instituicoesOpen)}
                      className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                        <span>{item.name}</span>
                      </div>
                      {instituicoesOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Submenu com TODAS as instituições */}
                    {instituicoesOpen && (
                      <div className="ml-4 pl-4 border-l border-gray-600 space-y-1">
                        {item.submenu.map((subItem) => {
                          const Icon = subItem.icon;
                          return (
                            <NavLink
                              key={subItem.name}
                              to={subItem.href}
                              className={({ isActive }) =>
                                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                  isActive
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`
                              }
                              title={subItem.descricao}
                            >
                              <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                              <span className="flex-1">{subItem.name}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Itens normais (Dashboard, Ver Investidores, Perfil)
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="mr-3 flex-shrink-0 h-6 w-6" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};