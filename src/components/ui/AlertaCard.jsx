import { Shield, Wrench, Building, AlertTriangle } from 'lucide-react';

export const AlertaCard = ({ tipo, quantidade, equipamentos }) => {
  const config = {
    garantia_expirar: {
      title: 'Garantias a Expirar',
      description: 'Equipamentos com garantia a expirar em 3 meses',
      icon: Shield,
      color: 'yellow'
    },
    manutencao_longa: {
      title: 'Manutenções Longas',
      description: 'Equipamentos em manutenção há mais de 30 dias',
      icon: Wrench,
      color: 'orange'
    },
    departamento_sem_equipamentos: {
      title: 'Departamentos sem Equipamentos',
      description: 'Departamentos sem equipamentos atribuídos',
      icon: Building,
      color: 'blue'
    }
  };

  const { title, description, icon: AlertIcon, color } = config[tipo] || { 
    title: tipo, 
    description: '', 
    icon: AlertTriangle, 
    color: 'red' 
  };

  const colorClasses = {
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' }
  };

  const colorConfig = colorClasses[color] || colorClasses.red;

  return (
    <div className={`${colorConfig.bg} border ${colorConfig.border} rounded-lg p-4`}>
      <div className="flex items-center">
        <AlertIcon className={`w-5 h-5 ${colorConfig.text} mr-3`} />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
          {equipamentos && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {equipamentos.split(',').slice(0, 3).join(', ')}
              {equipamentos.split(',').length > 3 && '...'}
            </p>
          )}
        </div>
        <span className={`text-lg font-bold ${colorConfig.text}`}>{quantidade}</span>
      </div>
    </div>
  );
};