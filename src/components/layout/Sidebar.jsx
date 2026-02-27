import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Monitor, 
  Users, 
  Truck, 
  ClipboardList, 
  Tags,
  BarChart3,
  User,
  History,
  Building
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = () => {
  const { isGestor } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    //{ name: 'Equipamentos', href: '/equipamentos', icon: Monitor },
    //{ name: 'Marcas', href: '/marcas', icon: Monitor },
    //{ name: 'Fomulario de Investimento', href: '/formulario-investimento', icon: Users },
    //{ name: 'Departamentos', href: '/departamentos', icon: Building }, // NOVA
    { name: 'Investidores', href: '/investidores', icon: Truck },
    { name: 'Ver Investidores', href: '/ver-investidores', icon: Truck },
    { name: 'Pagamento', href: '/ver-investidores', icon: Truck },
    //{ name: 'Atribuições', href: '/atribuicoes', icon: ClipboardList },
    //{ name: 'Categorias', href: '/categorias', icon: Tags },
    //{ name: 'Histórico Movimentações', href: '/historico-movimentacoes', icon: History },
  ];

  if (isGestor) {
    navigation.push({ name: 'Relatórios', href: '/relatorios', icon: BarChart3 });
  }

  navigation.push({ name: 'Meu Perfil', href: '/perfil', icon: User });

  return (
    <div className="w-64 bg-gray-800">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
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