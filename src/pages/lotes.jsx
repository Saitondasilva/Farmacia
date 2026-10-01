// pages/Lotes.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, ArrowLeft, Calendar, MapPin, Box, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { lotesService } from '../services/lotesService';
import { medicamentoService } from '../services/medicamentoService';
import { useForm } from 'react-hook-form';

export const Lotes = (props) => {
    const { onBack } = props;
    const { user } = useAuth();
    const [lotes, setLotes] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLote, setEditingLote] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEstoqueBaixo, setShowEstoqueBaixo] = useState(false);
    const [lotesVencidos, setLotesVencidos] = useState([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [lotesRes, medicamentosRes] = await Promise.all([
                lotesService.getAll(),
                medicamentoService.getAll()
            ]);

            // Enriquecer os lotes com o nome do medicamento
            const medicamentosMap = {};
            (medicamentosRes || []).forEach(m => {
                medicamentosMap[m.id] = m;
            });

            const lotesEnriquecidos = (lotesRes || []).map(lote => {
                const medicamento = medicamentosMap[lote.medicamento_id];
                return {
                    ...lote,
                    medicamento_nome: medicamento?.nome || '-',
                    medicamento_codigo: medicamento?.codigo_barras || '-',
                    esta_vencido: new Date(lote.data_validade) < new Date(),
                    esta_baixo: (lote.quantidade || 0) <= 5 // Alerta de estoque baixo
                };
            });

            setLotes(lotesEnriquecidos);
            setMedicamentos(medicamentosRes || []);
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const loadLotesVencidos = async () => {
        try {
            const hoje = new Date().toISOString().split('T')[0];
            const res = await lotesService.getAll();
            const vencidos = (res || []).filter(lote => 
                lote.data_validade && new Date(lote.data_validade) < new Date()
            );
            
            // Enriquecer com nome do medicamento
            const medicamentosMap = {};
            medicamentos.forEach(m => {
                medicamentosMap[m.id] = m;
            });

            const vencidosEnriquecidos = vencidos.map(lote => ({
                ...lote,
                medicamento_nome: medicamentosMap[lote.medicamento_id]?.nome || '-'
            }));

            setLotesVencidos(vencidosEnriquecidos);
            setShowEstoqueBaixo(true);
        } catch (error) {
            console.error('❌ Erro ao carregar lotes vencidos:', error);
            toast.error('Erro ao carregar lotes vencidos');
        }
    };

    const filteredLotes = lotes.filter(l =>
        l.medicamento_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.numero_lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.medicamento_codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setEditingLote(null);
        reset({
            quantidade: 0,
            quantidade_inicial: 0,
            data_fabrico: new Date().toISOString().split('T')[0],
            data_validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            preco_compra: 0
        });
        setShowModal(true);
    };

    const handleEdit = (lote) => {
        setEditingLote(lote);
        reset({
            ...lote,
            data_fabrico: lote.data_fabrico ? new Date(lote.data_fabrico).toISOString().split('T')[0] : '',
            data_validade: lote.data_validade ? new Date(lote.data_validade).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja eliminar este lote?')) return;
        try {
            await lotesService.delete(id);
            toast.success('Lote eliminado com sucesso!');
            await loadData();
        } catch (error) {
            console.error('❌ Erro ao eliminar:', error);
            toast.error('Erro ao eliminar lote: ' + (error.response?.data?.message || error.message));
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                medicamento_id: parseInt(data.medicamento_id),
                numero_lote: data.numero_lote,
                quantidade: parseInt(data.quantidade) || 0,
                quantidade_inicial: parseInt(data.quantidade_inicial) || parseInt(data.quantidade) || 0,
                data_fabrico: data.data_fabrico,
                data_validade: data.data_validade,
                preco_compra: parseFloat(data.preco_compra) || 0,
                localizacao: data.localizacao || null
            };

            console.log('📤 Enviando dados:', payload);

            if (editingLote) {
                await lotesService.update(editingLote.id, payload);
            } else {
                await lotesService.create(payload);
            }
            
            setShowModal(false);
            toast.success(editingLote ? 'Lote atualizado com sucesso!' : 'Lote criado com sucesso!');
            await loadData();
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            toast.error('Erro ao salvar lote: ' + (error.response?.data?.message || error.message));
        }
    };

    // Formatar data para exibição
    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-PT');
    };

    // Verificar se o lote está vencido
    const isVencido = (dataValidade) => {
        return new Date(dataValidade) < new Date();
    };

    // Verificar se o lote está com estoque baixo
    const isEstoqueBaixo = (quantidade) => {
        return quantidade <= 5;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <Button
                            variant="secondary"
                            onClick={onBack}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Voltar</span>
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lotes</h1>
                        <p className="text-gray-600">Gerir lotes de medicamentos</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="secondary"
                        onClick={loadLotesVencidos}
                        className="flex items-center space-x-2"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Lotes Vencidos</span>
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Lote
                    </Button>
                </div>
            </div>

            {/* Filtro de pesquisa */}
            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Pesquisar por medicamento, número de lote ou localização..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabela de lotes */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Medicamento</th>
                            <th>Nº Lote</th>
                            <th>Quantidade</th>
                            <th>Data Fabrico</th>
                            <th>Data Validade</th>
                            <th>Localização</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredLotes.map((l) => {
                            const vencido = isVencido(l.data_validade);
                            const baixo = isEstoqueBaixo(l.quantidade);
                            const rowClass = vencido ? 'bg-red-50' : baixo ? 'bg-yellow-50' : '';

                            return (
                                <tr key={l.id} className={rowClass}>
                                    <td className="font-medium">{l.medicamento_nome}</td>
                                    <td className="font-mono text-sm">{l.numero_lote || '-'}</td>
                                    <td>
                                        <span className={baixo ? 'text-red-600 font-bold' : ''}>
                                            {l.quantidade || 0}
                                        </span>
                                        {baixo && (
                                            <span className="ml-1 text-xs text-red-600">⚠️ Baixo</span>
                                        )}
                                    </td>
                                    <td className="text-sm">{formatarData(l.data_fabrico)}</td>
                                    <td className="text-sm">
                                        <span className={vencido ? 'text-red-600 font-bold' : ''}>
                                            {formatarData(l.data_validade)}
                                        </span>
                                        {vencido && (
                                            <span className="ml-1 text-xs text-red-600">Vencido</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="inline-flex items-center gap-1 text-sm">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            {l.localizacao || '-'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            vencido ? 'bg-red-100 text-red-800' :
                                            baixo ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {vencido ? 'Vencido' : baixo ? 'Estoque Baixo' : 'Ativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(l)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                title="Editar lote"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(l.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                title="Eliminar lote"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredLotes.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum lote encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Tente alterar o termo de pesquisa.' : 'Comece por adicionar um novo lote.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Criar/Editar Lote */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingLote ? 'Editar Lote' : 'Novo Lote'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Medicamento *</label>
                            <select
                                {...register('medicamento_id', { required: 'Medicamento é obrigatório' })}
                                className="input mt-1"
                            >
                                <option value="">Selecionar medicamento</option>
                                {medicamentos.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.nome} - {m.codigo_barras || 'Sem código'}
                                    </option>
                                ))}
                            </select>
                            {errors.medicamento_id && <p className="text-sm text-red-600">{errors.medicamento_id.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número do Lote *</label>
                            <input
                                {...register('numero_lote', { required: 'Número do lote é obrigatório' })}
                                type="text"
                                className="input mt-1"
                                placeholder="Ex: LOT-2024-001"
                            />
                            {errors.numero_lote && <p className="text-sm text-red-600">{errors.numero_lote.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Localização</label>
                            <input
                                {...register('localizacao')}
                                type="text"
                                className="input mt-1"
                                placeholder="Ex: Prateleira A2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantidade *</label>
                            <input
                                {...register('quantidade', { 
                                    required: 'Quantidade é obrigatória',
                                    min: { value: 0, message: 'Quantidade deve ser maior que 0' }
                                })}
                                type="number"
                                min="0"
                                className="input mt-1"
                                placeholder="0"
                            />
                            {errors.quantidade && <p className="text-sm text-red-600">{errors.quantidade.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantidade Inicial</label>
                            <input
                                {...register('quantidade_inicial')}
                                type="number"
                                min="0"
                                className="input mt-1"
                                placeholder="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Se não preenchido, será igual à quantidade atual</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Preço de Compra (€)</label>
                            <input
                                {...register('preco_compra')}
                                type="number"
                                step="0.01"
                                min="0"
                                className="input mt-1"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Fabrico</label>
                            <input
                                {...register('data_fabrico')}
                                type="date"
                                className="input mt-1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Validade *</label>
                            <input
                                {...register('data_validade', { 
                                    required: 'Data de validade é obrigatória',
                                    validate: value => {
                                        if (new Date(value) < new Date()) {
                                            return 'A data de validade não pode ser no passado';
                                        }
                                        return true;
                                    }
                                })}
                                type="date"
                                className="input mt-1"
                            />
                            {errors.data_validade && <p className="text-sm text-red-600">{errors.data_validade.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editingLote ? 'Atualizar' : 'Criar'} Lote
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Lotes Vencidos */}
            <Modal
                isOpen={showEstoqueBaixo}
                onClose={() => setShowEstoqueBaixo(false)}
                title="Lotes Vencidos"
                size="lg"
            >
                <div className="space-y-4">
                    {lotesVencidos.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="mx-auto h-12 w-12 text-green-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum lote vencido</h3>
                            <p className="mt-1 text-sm text-gray-500">Todos os lotes estão dentro do prazo de validade.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Medicamento</th>
                                        <th>Nº Lote</th>
                                        <th>Quantidade</th>
                                        <th>Data Validade</th>
                                        <th>Localização</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lotesVencidos.map(l => (
                                        <tr key={l.id} className="bg-red-50">
                                            <td className="font-medium">{l.medicamento_nome}</td>
                                            <td className="font-mono text-sm">{l.numero_lote}</td>
                                            <td className="text-red-600 font-bold">{l.quantidade || 0}</td>
                                            <td className="text-red-600 font-bold">{formatarData(l.data_validade)}</td>
                                            <td>{l.localizacao || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button variant="secondary" onClick={() => setShowEstoqueBaixo(false)}>
                            Fechar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};