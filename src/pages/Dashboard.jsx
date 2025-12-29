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

import { estatisticasService } from '../services/estatisticasService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatCard } from '../components/ui/StatCard';
import { AlertaCard } from '../components/ui/AlertaCard';

export const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setError(null);
            const [statsRes, alertasRes] = await Promise.all([
                estatisticasService.getDashboardStats(),
                estatisticasService.getAlertasSistema()
            ]);

            setStats(statsRes.data || {});

            // Garantir que alertas é um array
            const alertasData = alertasRes.data || [];
            setAlertas(Array.isArray(alertasData) ? alertasData : []);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            setError('Erro ao carregar dados do dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar</h3>
                    <p className="mt-1 text-sm text-gray-500">{error}</p>
                    <button
                        onClick={loadDashboardData}
                        className="mt-4 btn-primary"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // Calcular totais de forma segura
    const totalEquipamentosAtivos = (stats.equipamentos_disponiveis || 0) +
        (stats.equipamentos_em_uso || 0) +
        (stats.equipamentos_manutencao || 0);

    const totalEquipamentos = totalEquipamentosAtivos + (stats.equipamentos_descartados || 0);

    const taxaUtilizacao = totalEquipamentosAtivos > 0
        ? ((stats.equipamentos_em_uso || 0) / totalEquipamentosAtivos * 100)
        : 0;

    const totalAlertas = alertas.reduce((sum, alerta) => sum + (parseInt(alerta.quantidade) || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Visão geral do sistema de gestão de estoque de equipamentos</p>
                </div>
                <div className="text-sm text-gray-500">
                    Atualizado em {new Date().toLocaleDateString('pt-PT')}
                </div>
            </div>

            {/* Alertas */}
            {/*totalAlertas > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                        Alertas do Sistema
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alertas.map((alerta, index) => (
                            <AlertaCard
                                key={index}
                                tipo={alerta.tipo_alerta}
                                quantidade={parseInt(alerta.quantidade) || 0}
                                equipamentos={alerta.equipamentos || alerta.departamentos}
                            />
                        ))}
                    </div>
                </div>
            )*/}

            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Equipamentos Disponíveis"
                    value={stats.equipamentos_disponiveis || 0}
                    subtitle={`Total: ${totalEquipamentos} equipamentos`}
                    icon={Monitor}
                    color="green"
                />
                <StatCard
                    title="Em Uso"
                    value={stats.equipamentos_em_uso || 0}
                    subtitle={`${stats.atribuicoes_ativas || 0} atribuições ativas`}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="Em Manutenção"
                    value={stats.equipamentos_manutencao || 0}
                    subtitle={`${stats.manutencoes_pendentes || 0} pendentes`}
                    icon={Wrench}
                    color="yellow"
                />
                <StatCard
                    title="Funcionários Ativos"
                    value={stats.funcionarios_ativos || 0}
                    subtitle={`${stats.departamentos_ativos || 0} departamentos`}
                    icon={Users}
                    color="purple"
                />
            </div>

            {/* Segunda Linha de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Valor Total"
                    value={stats.valor_total_equipamentos ? `STN${(stats.valor_total_equipamentos / 1000).toFixed(1)}k` : 'STN0'}
                    subtitle="Investimento em equipamentos"
                    icon={DollarSign}
                    color="indigo"
                />
                <StatCard
                    title="Fornecedores"
                    value={stats.total_fornecedores || 0}
                    subtitle="Parceiros ativos"
                    icon={Truck}
                    color="green"
                />
                <StatCard
                    title="Atribuições Ativas"
                    value={stats.atribuicoes_ativas || 0}
                    subtitle="Equipamentos em uso"
                    icon={ClipboardCheck}
                    color="blue"
                />
                <StatCard
                    title="Manutenções Pendentes"
                    value={stats.manutencoes_pendentes || 0}
                    subtitle="Aguardando resolução"
                    icon={AlertTriangle}
                    color="red"
                />
            </div>

            {/* Gráficos e Detalhes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição por Estado */}
                <div className="card p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Equipamentos</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Disponíveis', value: stats.equipamentos_disponiveis || 0, color: 'bg-green-500' },
                            { label: 'Em Uso', value: stats.equipamentos_em_uso || 0, color: 'bg-blue-500' },
                            { label: 'Em Manutenção', value: stats.equipamentos_manutencao || 0, color: 'bg-yellow-500' },
                            { label: 'Descartados', value: stats.equipamentos_descartados || 0, color: 'bg-red-500' }
                        ].map((item, index) => {
                            const percentage = totalEquipamentos > 0 ? (item.value / totalEquipamentos) * 100 : 0;

                            return (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                        <span className="text-sm text-gray-600">{item.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${item.color}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                            {item.value} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Resumo do Sistema */}
                <div className="card p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do Sistema</h3>
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span>Total de Equipamentos Ativos:</span>
                            <span className="font-semibold text-gray-900">{totalEquipamentosAtivos}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span>Taxa de Utilização:</span>
                            <span className="font-semibold text-blue-600">
                                {taxaUtilizacao.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span>Departamentos Ativos:</span>
                            <span className="font-semibold text-gray-900">{stats.departamentos_ativos || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span>Fornecedores Registados:</span>
                            <span className="font-semibold text-gray-900">{stats.total_fornecedores || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span>Valor Total em Equipamentos:</span>
                            <span className="font-semibold text-gray-900">
                                {stats.valor_total_equipamentos ? `€${(stats.valor_total_equipamentos).toLocaleString('pt-PT')}` : '€0'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão de Atualização */}
            <div className="flex justify-center">
                <button
                    onClick={loadDashboardData}
                    className="btn-secondary flex items-center space-x-2"
                    disabled={loading}
                >
                    {loading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        <Calendar className="w-4 h-4" />
                    )}
                    <span>{loading ? 'A Atualizar...' : 'Atualizar Dados'}</span>
                </button>
            </div>
        </div>
    );
};