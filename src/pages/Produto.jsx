// pages/Produto.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeft, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { medicamentoService } from '../services/medicamentoService';
import { categoriaService } from '../services/categoriaService';
import { fornecedorService } from '../services/fornecedorService';
import { useForm } from 'react-hook-form';

export const Produto = (props) => {
    const { onBack } = props;
    const { user } = useAuth();
    const [medicamentos, setMedicamentos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMedicamento, setEditingMedicamento] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEstoqueBaixo, setShowEstoqueBaixo] = useState(false);
    const [estoqueBaixoList, setEstoqueBaixoList] = useState([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [medicamentosRes, categoriasRes, fornecedoresRes] = await Promise.all([
                medicamentoService.getAll(),
                categoriaService.getAll(),
                fornecedorService.getAll()
            ]);

            console.log('📦 Dados recebidos:', {
                medicamentos: medicamentosRes?.length,
                categorias: categoriasRes?.length,
                fornecedores: fornecedoresRes?.length
            });

            // Log do primeiro medicamento para debug
            if (medicamentosRes && medicamentosRes.length > 0) {
                console.log('📦 Primeiro medicamento:', medicamentosRes[0]);
            }

            // Criar maps para busca rápida
            const categoriasMap = {};
            (categoriasRes || []).forEach(c => {
                categoriasMap[c.id] = c;
            });
            
            const fornecedoresMap = {};
            (fornecedoresRes || []).forEach(f => {
                fornecedoresMap[f.id] = f;
            });

            // Enriquecer os medicamentos com os dados das categorias e fornecedores
            const medicamentosEnriquecidos = (medicamentosRes || []).map(m => {
                // Buscar categoria pelo ID (usando descricao ou nome)
                const categoria = categoriasMap[m.categoria_id] || null;
                const fornecedor = fornecedoresMap[m.fornecedor_id] || null;
                
                return {
                    ...m,
                    categoria: categoria,
                    fornecedor: fornecedor,
                    // O backend já retorna categoria_nome e fornecedor_nome, mas vamos garantir
                    categoria_nome: m.categoria_nome || categoria?.descricao || categoria?.nome || '-',
                    fornecedor_nome: m.fornecedor_nome || fornecedor?.nome || '-',
                    // Usar stock_atual do backend ou fallback
                    stock_atual: m.stock_atual || m.quantidade || m.stock || 0
                };
            });

            console.log('📦 Medicamentos enriquecidos (primeiro):', medicamentosEnriquecidos[0]);

            setMedicamentos(medicamentosEnriquecidos);
            setCategorias(categoriasRes || []);
            setFornecedores(fornecedoresRes || []);
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const loadEstoqueBaixo = async () => {
        try {
            const res = await medicamentoService.estoqueBaixo();
            setEstoqueBaixoList(res || []);
            setShowEstoqueBaixo(true);
        } catch (error) {
            console.error('❌ Erro ao carregar estoque baixo:', error);
            toast.error('Erro ao carregar produtos com estoque baixo');
        }
    };

    // 🔥 FUNÇÃO CORRIGIDA - Busca categoria
    const getCategoriaNome = (medicamento) => {
        // Se já tem o nome da categoria no objeto (do backend)
        if (medicamento.categoria_nome) {
            return medicamento.categoria_nome;
        }
        
        // Se tem o objeto categoria populado
        if (medicamento.categoria?.descricao) {
            return medicamento.categoria.descricao;
        }
        if (medicamento.categoria?.nome) {
            return medicamento.categoria.nome;
        }
        
        // Se tem categoria_id, buscar na lista de categorias
        if (medicamento.categoria_id && categorias.length > 0) {
            const categoria = categorias.find(c => c.id === medicamento.categoria_id);
            return categoria?.descricao || categoria?.nome || '-';
        }
        
        return '-';
    };

    // 🔥 FUNÇÃO CORRIGIDA - Busca fornecedor
    const getFornecedorNome = (medicamento) => {
        // Se já tem o nome do fornecedor no objeto (do backend)
        if (medicamento.fornecedor_nome) {
            return medicamento.fornecedor_nome;
        }
        
        // Se tem o objeto fornecedor populado
        if (medicamento.fornecedor?.nome) {
            return medicamento.fornecedor.nome;
        }
        
        // Se tem fornecedor_id, buscar na lista de fornecedores
        if (medicamento.fornecedor_id && fornecedores.length > 0) {
            const fornecedor = fornecedores.find(f => f.id === medicamento.fornecedor_id);
            return fornecedor?.nome || '-';
        }
        
        return '-';
    };

    // 🔥 FUNÇÃO CORRIGIDA - Obtém estoque atual
    const getEstoqueAtual = (medicamento) => {
        return medicamento.stock_atual || medicamento.quantidade || medicamento.stock || 0;
    };

    // 🔥 FUNÇÃO CORRIGIDA - Verifica estoque baixo
    const isEstoqueBaixo = (medicamento) => {
        const estoque = getEstoqueAtual(medicamento);
        return estoque <= (medicamento.stock_minimo || 0);
    };

    const filteredMedicamentos = medicamentos.filter(m => {
        const searchLower = searchTerm.toLowerCase();
        const categoriaNome = getCategoriaNome(m);
        const fornecedorNome = getFornecedorNome(m);
        
        return (
            m.nome?.toLowerCase().includes(searchLower) ||
            m.nome_generico?.toLowerCase().includes(searchLower) ||
            m.codigo_barras?.toLowerCase().includes(searchLower) ||
            m.dosagem?.toLowerCase().includes(searchLower) ||
            categoriaNome.toLowerCase().includes(searchLower) ||
            fornecedorNome.toLowerCase().includes(searchLower)
        );
    });

    const handleCreate = () => {
        setEditingMedicamento(null);
        reset({
            ativo: true,
            receita_obrigatoria: false,
            preco_compra: '',
            preco_venda: '',
            stock_minimo: ''
        });
        setShowModal(true);
    };

    const handleEdit = (medicamento) => {
        setEditingMedicamento(medicamento);
        reset({
            ...medicamento,
            categoria_id: medicamento.categoria_id || medicamento.categoria?.id,
            fornecedor_id: medicamento.fornecedor_id || medicamento.fornecedor?.id
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja eliminar este medicamento?')) return;
        try {
            await medicamentoService.delete(id);
            toast.success('Medicamento eliminado com sucesso!');
            await loadData();
        } catch (error) {
            console.error('❌ Erro ao eliminar:', error);
            toast.error('Erro ao eliminar medicamento: ' + (error.response?.data?.message || error.message));
        }
    };

  // pages/Produto.jsx - onSubmit corrigido
const onSubmit = async (data) => {
    try {
        const payload = {
            nome: data.nome,
            nome_generico: data.nome_generico || null,
            codigo_barras: data.codigo_barras || null,
            dosagem: data.dosagem || null,
            forma_farmaceutica: data.forma_farmaceutica || null,
            preco_compra: parseFloat(data.preco_compra) || 0,
            preco_venda: parseFloat(data.preco_venda) || 0,
            stock_minimo: parseInt(data.stock_minimo) || 5,
            controlado: 0, // Valor padrão
            receita_obrigatoria: data.receita_obrigatoria === true || data.receita_obrigatoria === 'true' ? 1 : 0,
            ativo: data.ativo === true || data.ativo === 'true' ? 1 : 0,
            categoria_id: parseInt(data.categoria_id),
            fornecedor_id: parseInt(data.fornecedor_id),
            observacoes: data.observacoes || null
        };

        console.log('📤 Enviando dados:', payload);

        if (editingMedicamento) {
            await medicamentoService.update(editingMedicamento.id, payload);
        } else {
            await medicamentoService.create(payload);
        }
        
        setShowModal(false);
        toast.success(editingMedicamento ? 'Medicamento atualizado com sucesso!' : 'Medicamento criado com sucesso!');
        await loadData();
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        toast.error('Erro ao salvar medicamento: ' + (error.response?.data?.message || error.message));
    }
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
                        <h1 className="text-2xl font-bold text-gray-900">Medicamentos</h1>
                        <p className="text-gray-600">Gerir o catálogo de medicamentos</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="secondary"
                        onClick={loadEstoqueBaixo}
                        className="flex items-center space-x-2"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Estoque Baixo</span>
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Medicamento
                    </Button>
                </div>
            </div>

            {/* Filtro de pesquisa */}
            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, código de barras, dosagem..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabela de medicamentos */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Nome Genérico</th>
                            <th>Código de Barras</th>
                            <th>Dosagem</th>
                            <th>Categoria</th>
                            <th>Preço Venda</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredMedicamentos.map((m) => (
                            <tr key={m.id} className={isEstoqueBaixo(m) ? 'bg-red-50' : ''}>
                                <td className="font-medium">{m.nome}</td>
                                <td>{m.nome_generico || '-'}</td>
                                <td className="font-mono text-sm">{m.codigo_barras || '-'}</td>
                                <td>{m.dosagem || '-'}</td>
                                <td>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {getCategoriaNome(m)}
                                    </span>
                                </td>
                                <td>€ {parseFloat(m.preco_venda || 0).toFixed(2)}</td>
                                <td>
                                    <span className={isEstoqueBaixo(m) ? 'text-red-600 font-bold' : ''}>
                                        {getEstoqueAtual(m)}
                                    </span>
                                    {isEstoqueBaixo(m) && (
                                        <span className="ml-1 text-xs text-red-600">⚠️ Baixo</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        m.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {m.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                    {m.receita_obrigatoria && (
                                        <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Receita
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(m)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                            title="Editar medicamento"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(m.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Eliminar medicamento"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredMedicamentos.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum medicamento encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Tente alterar o termo de pesquisa.' : 'Comece por adicionar um novo medicamento.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Criar/Editar Medicamento */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingMedicamento ? 'Editar Medicamento' : 'Novo Medicamento'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome *</label>
                            <input
                                {...register('nome', { required: 'Nome é obrigatório' })}
                                type="text"
                                className="input mt-1"
                                placeholder="Nome do medicamento"
                            />
                            {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome Genérico</label>
                            <input
                                {...register('nome_generico')}
                                type="text"
                                className="input mt-1"
                                placeholder="Nome genérico do medicamento"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código de Barras</label>
                            <input
                                {...register('codigo_barras')}
                                type="text"
                                className="input mt-1 font-mono"
                                placeholder="Código de barras do produto"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dosagem</label>
                            <input
                                {...register('dosagem')}
                                type="text"
                                className="input mt-1"
                                placeholder="Ex: 500mg, 10ml"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Forma Farmacêutica</label>
                            <select
                                {...register('forma_farmaceutica')}
                                className="input mt-1"
                            >
                                <option value="">Selecionar</option>
                                <option value="comprimido">Comprimido</option>
                                <option value="capsula">Cápsula</option>
                                <option value="xarope">Xarope</option>
                                <option value="suspensao">Suspensão</option>
                                <option value="injecao">Injeção</option>
                                <option value="pomada">Pomada</option>
                                <option value="creme">Creme</option>
                                <option value="solucao">Solução</option>
                                <option value="gotas">Gotas</option>
                                <option value="inalador">Inalador</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoria *</label>
                            <select
                                {...register('categoria_id', { required: 'Categoria é obrigatória' })}
                                className="input mt-1"
                            >
                                <option value="">Selecionar categoria</option>
                                {categorias.map(c => (
                                    <option key={c.id} value={c.id}>{c.descricao || c.nome}</option>
                                ))}
                            </select>
                            {errors.categoria_id && <p className="text-sm text-red-600">{errors.categoria_id.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fornecedor *</label>
                            <select
                                {...register('fornecedor_id', { required: 'Fornecedor é obrigatório' })}
                                className="input mt-1"
                            >
                                <option value="">Selecionar fornecedor</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nome}</option>
                                ))}
                            </select>
                            {errors.fornecedor_id && <p className="text-sm text-red-600">{errors.fornecedor_id.message}</p>}
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
                            <label className="block text-sm font-medium text-gray-700">Preço de Venda (€) *</label>
                            <input
                                {...register('preco_venda', { required: 'Preço de venda é obrigatório', min: 0 })}
                                type="number"
                                step="0.01"
                                min="0"
                                className="input mt-1"
                                placeholder="0.00"
                            />
                            {errors.preco_venda && <p className="text-sm text-red-600">{errors.preco_venda.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                            <input
                                {...register('stock_minimo')}
                                type="number"
                                min="0"
                                className="input mt-1"
                                placeholder="0"
                            />
                        </div>

                        <div className="flex items-center space-x-4 col-span-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    {...register('ativo')}
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="text-sm font-medium text-gray-700">Ativo</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    {...register('receita_obrigatoria')}
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="text-sm font-medium text-gray-700">Receita Obrigatória</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editingMedicamento ? 'Atualizar' : 'Criar'} Medicamento
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Estoque Baixo */}
            <Modal
                isOpen={showEstoqueBaixo}
                onClose={() => setShowEstoqueBaixo(false)}
                title="Produtos com Estoque Baixo"
                size="lg"
            >
                <div className="space-y-4">
                    {estoqueBaixoList.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="mx-auto h-12 w-12 text-green-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Todos os produtos estão com stock adequado</h3>
                            <p className="mt-1 text-sm text-gray-500">Nenhum produto com estoque baixo encontrado.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Stock Atual</th>
                                        <th>Stock Mínimo</th>
                                        <th>Diferença</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estoqueBaixoList.map(m => (
                                        <tr key={m.id} className="bg-red-50">
                                            <td className="font-medium">{m.nome}</td>
                                            <td className="text-red-600 font-bold">{m.stock_atual || m.quantidade || m.stock || 0}</td>
                                            <td>{m.stock_minimo || 0}</td>
                                            <td className="text-red-600">
                                                {(m.stock_atual || m.quantidade || m.stock || 0) - (m.stock_minimo || 0)} unidades
                                            </td>
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