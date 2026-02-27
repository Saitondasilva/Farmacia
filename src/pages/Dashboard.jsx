import { useState, useEffect } from 'react';
import {
  Monitor,
  Users,
  Truck,
  Wrench,
  DollarSign,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatCard } from '../components/ui/StatCard';

export const Dashboard = () => {
  const [stats, setStats] = useState(null); // inicialmente null para simular loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulação de dados fixos
      const fakeData = {
        equipamentos_disponiveis: 10,
        equipamentos_em_uso: 5,
        equipamentos_manutencao: 2,
        equipamentos_descartados: 1,
        funcionarios_ativos: 8,
        departamentos_ativos: 3,
        valor_total_equipamentos: 500000,
        total_fornecedores: 4,
        atribuicoes_ativas: 5,
        manutencoes_pendentes: 2
      };

      // Simular atraso para testar LoadingSpinner
      await new Promise(res => setTimeout(res, 500));

      setStats(fakeData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Cálculos principais
  const totalEquipamentosAtivos =
    stats.equipamentos_disponiveis +
    stats.equipamentos_em_uso +
    stats.equipamentos_manutencao;

  const totalEquipamentos =
    totalEquipamentosAtivos + stats.equipamentos_descartados;

  const taxaUtilizacao =
    totalEquipamentosAtivos > 0
      ? (stats.equipamentos_em_uso / totalEquipamentosAtivos) * 100
      : 0;

  // Dados para gráficos
  const equipamentosPorEstado = [
    { name: 'Disponíveis', value: stats.equipamentos_disponiveis },
    { name: 'Em Uso', value: stats.equipamentos_em_uso },
    { name: 'Manutenção', value: stats.equipamentos_manutencao },
    { name: 'Descartados', value: stats.equipamentos_descartados }
  ];

  const utilizacaoData = [
    { name: 'Em Uso', value: stats.equipamentos_em_uso },
    { name: 'Disponíveis', value: stats.equipamentos_disponiveis }
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#facc15', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Visão geral do sistema de gestão de Investidores
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Atualizado em {new Date().toLocaleDateString('pt-PT')}
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Investidores inscritos"
          value={stats.equipamentos_disponiveis}
          subtitle={`Total: ${totalEquipamentos} equipamentos`}
          icon={Monitor}
          color="green"
        />
        <StatCard
          title="Em Uso"
          value={stats.equipamentos_em_uso}
          subtitle={`${stats.atribuicoes_ativas} atribuições ativas`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Solicitação em Espera"
          value={stats.equipamentos_manutencao}
          subtitle={`${stats.manutencoes_pendentes} pendentes`}
          icon={Wrench}
          color="yellow"
        />
        <StatCard
          title="Solicitação Aceites"
          value={stats.funcionarios_ativos}
          subtitle={`${stats.departamentos_ativos} departamentos`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Segunda linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Valor Total"
          value={`STN${(stats.valor_total_equipamentos / 1000).toFixed(1)}k`}
          subtitle="Investimento em equipamentos"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Fornecedores"
          value={stats.total_fornecedores}
          subtitle="Parceiros ativos"
          icon={Truck}
          color="green"
        />
        <StatCard
          title="Atribuições Ativas"
          value={stats.atribuicoes_ativas}
          subtitle="Equipamentos em uso"
          icon={ClipboardCheck}
          color="blue"
        />
        <StatCard
          title="investidores pendentes"
          value={stats.manutencoes_pendentes}
          subtitle="Aguardando resolução"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizza */}
        <div className="card p-6 min-h-[350px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
           Estatisticas em relação aos pedidos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={equipamentosPorEstado}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {equipamentosPorEstado.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Barras */}
        <div className="card p-6 min-h-[350px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
           Em verrificação
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utilizacaoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Resumo dos Investidores
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aceites
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pendentes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Em verrificação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipamentosPorEstado.map((item, index) => {
                const percent = ((item.value / totalEquipamentos) * 100).toFixed(1);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.value}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão Atualizar */}
      <div className="flex justify-center">
        <button
          onClick={loadDashboardData}
          className="btn-secondary flex items-center space-x-2"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : <Calendar className="w-4 h-4" />}
          <span>{loading ? 'A Atualizar...' : 'Atualizar Dados'}</span>
        </button>
      </div>
    </div>
  );
};
