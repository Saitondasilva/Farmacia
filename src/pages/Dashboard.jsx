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
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Eye
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
  Legend,
  LineChart,
  Line
} from 'recharts';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatCard } from '../components/ui/StatCard';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processosRecentes, setProcessosRecentes] = useState([]);
  const [ultimos30Dias, setUltimos30Dias] = useState([]); // <-- MOVIDO PARA O STATE
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Buscar dados reais do localStorage
      const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      
      // Calcular estatísticas
      const totalInvestidores = investidores.length;
      
      // Status dos processos
      const pendentes = investidores.filter(i => i.status === 'PENDENTE' || i.status === 'EM_ANALISE').length;
      const aprovados = investidores.filter(i => i.status === 'APROVADO').length;
      const recusados = investidores.filter(i => i.status === 'REJEITADO').length;
      const enviados = investidores.filter(i => i.status === 'ENVIADO').length;
      
      // Workflow - onde cada processo está
      const naInstituicoes = {
        mp: investidores.filter(i => i.workflow?.instituicao_atual === 'mp').length,
        mj: investidores.filter(i => i.workflow?.instituicao_atual === 'mj').length,
        cm: investidores.filter(i => i.workflow?.instituicao_atual === 'cm').length,
        financas: investidores.filter(i => i.workflow?.instituicao_atual === 'financas').length,
        sef: investidores.filter(i => i.workflow?.instituicao_atual === 'sef').length,
        registro: investidores.filter(i => i.workflow?.instituicao_atual === 'registro').length
      };
      
      // Valor total de investimentos
      const valorTotalInvestimentos = investidores.reduce((acc, i) => acc + (i.valor_investimento || 0), 0);
      
      // Processos com prazo próximo (5 dias para expirar)
      const processosExpiracaoProxima = investidores.filter(i => {
        if (i.workflow?.historico) {
          const itemAtual = i.workflow.historico.find(h => h.status === 'AGUARDANDO');
          if (itemAtual) {
            const dataExpiracao = new Date(itemAtual.data_recebimento);
            dataExpiracao.setDate(dataExpiracao.getDate() + 30);
            const diasRestantes = differenceInDays(dataExpiracao, new Date());
            return diasRestantes <= 5 && diasRestantes > 0;
          }
        }
        return false;
      }).length;
      
      // Processos expirados
      const processosExpirados = investidores.filter(i => {
        if (i.workflow?.historico) {
          return i.workflow.historico.some(h => h.status === 'EXPIRADO');
        }
        return false;
      }).length;
      
      // Dados para gráfico de linha (últimos 30 dias)
      const dadosUltimos30Dias = [];
      for (let i = 29; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const dataStr = format(data, 'dd/MM');
        
        const count = investidores.filter(inv => {
          const dataEnvio = inv.workflow?.timeline?.[0]?.data || inv.data_submissao;
          return dataEnvio && format(parseISO(dataEnvio), 'dd/MM') === dataStr;
        }).length;
        
        dadosUltimos30Dias.push({ data: dataStr, processos: count });
      }
      
      // Processos recentes (últimos 5)
      const recentes = [...investidores]
        .sort((a, b) => {
          const dataA = a.workflow?.timeline?.[0]?.data || a.data_submissao || '2000-01-01';
          const dataB = b.workflow?.timeline?.[0]?.data || b.data_submissao || '2000-01-01';
          return new Date(dataB) - new Date(dataA);
        })
        .slice(0, 5)
        .map(inv => ({
          id: inv.id,
          codigo: inv.codigo_identificacao,
          nome: inv.nome_completo,
          status: inv.status,
          instituicaoAtual: inv.workflow?.instituicao_atual || 'UCID',
          valor: inv.valor_investimento,
          data: inv.workflow?.timeline?.[0]?.data || inv.data_submissao
        }));

      setStats({
        totalInvestidores,
        pendentes,
        aprovados,
        recusados,
        enviados,
        naInstituicoes,
        valorTotalInvestimentos,
        processosExpiracaoProxima,
        processosExpirados
      });
      
      setProcessosRecentes(recentes);
      setUltimos30Dias(dadosUltimos30Dias); // <-- SETANDO O STATE
      
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      // Dados de fallback para não quebrar a tela
      setStats({
        totalInvestidores: 0,
        pendentes: 0,
        aprovados: 0,
        recusados: 0,
        enviados: 0,
        naInstituicoes: { mp: 0, mj: 0, cm: 0, financas: 0, sef: 0, registro: 0 },
        valorTotalInvestimentos: 0,
        processosExpiracaoProxima: 0,
        processosExpirados: 0
      });
      setProcessosRecentes([]);
      setUltimos30Dias([]);
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

  // Dados para gráficos
  const statusData = [
    { name: 'Pendentes', value: stats.pendentes, color: '#facc15' },
    { name: 'Em Instituições', value: stats.enviados, color: '#3b82f6' },
    { name: 'Aprovados', value: stats.aprovados, color: '#22c55e' },
    { name: 'Recusados', value: stats.recusados, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const instituicoesData = [
    { name: 'MP', value: stats.naInstituicoes.mp, color: '#8b5cf6' },
    { name: 'MJ', value: stats.naInstituicoes.mj, color: '#ec4899' },
    { name: 'CM', value: stats.naInstituicoes.cm, color: '#14b8a6' },
    { name: 'Finanças', value: stats.naInstituicoes.financas, color: '#f97316' },
    { name: 'SEF', value: stats.naInstituicoes.sef, color: '#6b7280' },
    { name: 'Reg. Civil', value: stats.naInstituicoes.registro, color: '#a855f7' }
  ].filter(i => i.value > 0);

  const getStatusBadge = (status) => {
    const config = {
      PENDENTE: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      EM_ANALISE: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      ENVIADO: { color: 'bg-purple-100 text-purple-800', icon: Send },
      APROVADO: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJEITADO: { color: 'bg-red-100 text-red-800', icon: XCircle },
      EXPIRADO: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    };
    return config[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UCID-STP</h1>
          <p className="text-gray-600">
            Visão geral do fluxo de processos de investimento
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Atualizado em {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </div>
      </div>

      {/* Alertas de prazo */}
      {(stats.processosExpiracaoProxima > 0 || stats.processosExpirados > 0) && (
        <div className="space-y-2">
          {stats.processosExpiracaoProxima > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-bold">{stats.processosExpiracaoProxima}</span> processo(s) com prazo próximo a expirar (menos de 5 dias)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {stats.processosExpirados > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <span className="font-bold">{stats.processosExpirados}</span> processo(s) expirado(s) - Necessário reenvio
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Processos"
          value={stats.totalInvestidores}
          subtitle="Investidores registados"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Em Instituições"
          value={stats.enviados}
          subtitle="Aguardando análise externa"
          icon={Send}
          color="purple"
        />
        <StatCard
          title="Valor Total"
          value={`$${(stats.valorTotalInvestimentos / 1000000).toFixed(1)}M`}
          subtitle="Em investimentos"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Aprovados"
          value={stats.aprovados}
          subtitle="Processos concluídos"
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Segunda linha - Status críticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pendentes"
          value={stats.pendentes}
          subtitle="Aguardando envio"
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Recusados"
          value={stats.recusados}
          subtitle="Processos negados"
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Próximos Expirar"
          value={stats.processosExpiracaoProxima}
          subtitle="Menos de 5 dias"
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          title="Expirados"
          value={stats.processosExpirados}
          subtitle="Necessitam reenvio"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizza - Distribuição por Status */}
        {statusData.length > 0 && (
          <div className="card p-6 min-h-[350px]">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Distribuição de Processos por Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Barras - Processos nas Instituições */}
        {instituicoesData.length > 0 && (
          <div className="card p-6 min-h-[350px]">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Processos em Análise por Instituição
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={instituicoesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6">
                  {instituicoesData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Linha - Evolução de Processos */}
        <div className="card p-6 min-h-[350px] lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Evolução de Processos (Últimos 30 dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ultimos30Dias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" interval={5} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="processos" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Novos Processos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Processos Recentes */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Processos Recentes
          </h3>
          <button
            onClick={() => navigate('/investidores')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver todos
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processosRecentes.map((processo) => {
                const badge = getStatusBadge(processo.status);
                const StatusIcon = badge.icon;
                
                return (
                  <tr key={processo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">
                      {processo.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {processo.nome}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {processo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {processo.instituicaoAtual === 'UCID' ? 'UCID' : 
                       processo.instituicaoAtual?.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${processo.valor?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {processo.data ? format(parseISO(processo.data), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/investidores/editar/${processo.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
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