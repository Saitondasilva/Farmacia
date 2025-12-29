import { useState, useMemo, useEffect } from 'react';
import { Plus, CheckCircle, Edit, RotateCcw, Filter, Building, DoorOpen, Move, AlertTriangle, Search, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SalaSelect } from '../components/ui/SalaSelect';
import { TransferenciaSalaModal } from '../components/ui/TransferenciaSalaModal';
import { atribuicoesService } from '../services/atribuicoesService';
import { equipamentosService } from '../services/equipamentosService';
import { funcionariosService } from '../services/funcionariosService';
import { departamentosService } from '../services/departamentosService';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Pagination } from '../components/ui/Pagination';
import { toast } from 'sonner';

export const Atribuicoes = () => {
  //const [atribuicoes, setAtribuicoes] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransferenciaModal, setShowTransferenciaModal] = useState(false);
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState(null);
  const [atribuicoesAtivas, setAtribuicoesAtivas] = useState([]);
  const [atribuicoesDevolvidas, setAtribuicoesDevolvidas] = useState([]);
  const [selectedEquipamentos, setSelectedEquipamentos] = useState([]);
  const [filterTipo, setFilterTipo] = useState('ativas');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDevolucaoModal, setShowDevolucaoModal] = useState(false);
  const [grupoParaDevolver, setGrupoParaDevolver] = useState(null);
  const [tipoDevolucao, setTipoDevolucao] = useState('');
  const [equipamentoParaDevolver, setEquipamentoParaDevolver] = useState(null);
  
  // Novos estados para filtros
  const [filtroFuncionario, setFiltroFuncionario] = useState('');
  const [filtroEquipamento, setFiltroEquipamento] = useState('');
  const [equipamentosExpandidos, setEquipamentosExpandidos] = useState({});
  
  // Estados para paginação manual
  const [currentPage, setCurrentPage] = useState(1);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  const selectedDepartamentoId = watch('departamento_id');
  const selectedFuncionarioId = watch('funcionario_id');

  // Filtrar atribuições com os novos filtros
  const filteredAtribuicoes = useMemo(() => {
    let dados = [];

    switch (filterTipo) {
      case 'ativas':
        dados = Array.isArray(atribuicoesAtivas) ? atribuicoesAtivas : [];
        break;
      case 'devolvidas':
        dados = Array.isArray(atribuicoesDevolvidas) ? atribuicoesDevolvidas : [];
        break;
      case 'todas':
        dados = [
          ...(Array.isArray(atribuicoesAtivas) ? atribuicoesAtivas : []),
          ...(Array.isArray(atribuicoesDevolvidas) ? atribuicoesDevolvidas : [])
        ];
        break;
      default:
        dados = Array.isArray(atribuicoesAtivas) ? atribuicoesAtivas : [];
    }

    // Aplicar filtro por nome do funcionário
    if (filtroFuncionario.trim() !== '') {
      const termo = filtroFuncionario.toLowerCase().trim();
      dados = dados.filter(atribuicao => 
        atribuicao.funcionario_nome?.toLowerCase().includes(termo)
      );
    }

    // Aplicar filtro por equipamento
    if (filtroEquipamento.trim() !== '') {
      const termo = filtroEquipamento.toLowerCase().trim();
      dados = dados.filter(atribuicao => 
        atribuicao.equipamento_modelo?.toLowerCase().includes(termo) ||
        atribuicao.numero_serie?.toLowerCase().includes(termo)
      );
    }

    return dados;
  }, [filterTipo, atribuicoesAtivas, atribuicoesDevolvidas, filtroFuncionario, filtroEquipamento]);

  // Filtrar equipamentos disponíveis (não atribuídos)
  const equipamentosDisponiveis = useMemo(() => {
    return equipamentos.filter(equipamento =>
      equipamento.estado === 'Disponível' &&
      !atribuicoesAtivas.some(atribuicao =>
        atribuicao.equipamento_id === equipamento.id
      )
    );
  }, [equipamentos, atribuicoesAtivas]);

  // Função para dados do funcionário
  const getDadosFuncionario = (atribuicao) => {
    if (!atribuicao || !funcionarios.length || !departamentos.length) {
      return {
        funcionario: null,
        departamento: null,
        sala: 'Não definida',
        nomeDepartamento: 'Não definido'
      };
    }

    let funcionario = funcionarios.find(f =>
      f.id?.toString() === atribuicao.funcionario_id?.toString()
    );

    if (!funcionario && atribuicao.funcionario_nome) {
      funcionario = funcionarios.find(f =>
        f.nome?.trim().toLowerCase().includes(atribuicao.funcionario_nome?.trim().toLowerCase()) ||
        atribuicao.funcionario_nome?.trim().toLowerCase().includes(f.nome?.trim().toLowerCase())
      );
    }

    let departamento = null;
    if (funcionario?.departamento_id) {
      departamento = departamentos.find(d =>
        d.id?.toString() === funcionario.departamento_id?.toString()
      );
    }

    return {
      funcionario: funcionario || null,
      departamento: departamento || null,
      sala: funcionario?.sala || 'Não definida',
      nomeDepartamento: departamento?.nome || 'Não definido'
    };
  };

  // Na tabela, agrupar atribuições por funcionário
  const atribuicoesAgrupadas = useMemo(() => {
    const agrupadas = {};

    filteredAtribuicoes.forEach(atribuicao => {
      const key = `${atribuicao.funcionario_id}-${atribuicao.funcionario_nome}`;

      if (!agrupadas[key]) {
        const dadosFuncionario = getDadosFuncionario(atribuicao);

        agrupadas[key] = {
          funcionario_id: atribuicao.funcionario_id,
          funcionario_nome: atribuicao.funcionario_nome,
          cargo: atribuicao.cargo,
          departamento: dadosFuncionario.nomeDepartamento,
          sala: dadosFuncionario.sala,
          equipamentos: [],
          data_atribuicao: atribuicao.data_atribuicao,
          estado_entrega: atribuicao.estado_entrega,
          data_devolucao: atribuicao.data_devolucao,
          atribuicoesIndividuais: []
        };
      }

      // Adicionar equipamento ao grupo
      agrupadas[key].equipamentos.push({
        id: atribuicao.equipamento_id,
        modelo: atribuicao.equipamento_modelo,
        numero_serie: atribuicao.numero_serie,
        atribuicao_id: atribuicao.atribuicao_id || atribuicao.id,
        estado: atribuicao.estado_entrega,
        data_atribuicao: atribuicao.data_atribuicao,
        data_devolucao: atribuicao.data_devolucao
      });

      // Armazenar atribuição individual
      agrupadas[key].atribuicoesIndividuais.push(atribuicao);
    });

    return Object.values(agrupadas);
  }, [filteredAtribuicoes]);

  // Calcular paginação manualmente
  const totalItems = atribuicoesAgrupadas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Calcular dados da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = atribuicoesAgrupadas.slice(startIndex, endIndex);

  // Resetar para a primeira página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTipo, filtroFuncionario, filtroEquipamento]);

  // CARREGAR TODOS OS DADOS
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        //atribuicoesRes,
        equipamentosRes,
        funcionariosRes,
        departamentosRes,
        ativas,
        devolvidas
      ] = await Promise.all([
        atribuicoesService.getAll(),
        equipamentosService.getAll(),
        funcionariosService.getAll(),
        departamentosService.getAll(),
        atribuicoesService.getAtivas(),
        atribuicoesService.getDevolvidas()
      ]);

      //setAtribuicoes(atribuicoesRes.data?.data || []);
      setEquipamentos(equipamentosRes.data?.filter(e => e.estado === 'Disponível') || []);
      setFuncionarios(funcionariosRes.data || []);
      setDepartamentos(departamentosRes.data || []);
      setAtribuicoesAtivas(Array.isArray(ativas) ? ativas : []);
      setAtribuicoesDevolvidas(Array.isArray(devolvidas) ? devolvidas : []);

    } catch (error) {
      toast.error('Erro ao carregar dados' , error.message);
      //setAtribuicoes([]);
      setAtribuicoesAtivas([]);
      setAtribuicoesDevolvidas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroFuncionario('');
    setFiltroEquipamento('');
    setFilterTipo('ativas');
    setCurrentPage(1);
  };

  // Toggle para mostrar/ocultar equipamentos de um funcionário
  const toggleEquipamentos = (grupoId) => {
    setEquipamentosExpandidos(prev => ({
      ...prev,
      [grupoId]: !prev[grupoId]
    }));
  };

  // Filtrar funcionários por departamento selecionado
  const funcionariosFiltrados = selectedDepartamentoId
    ? funcionarios.filter(f => f.departamento_id.toString() === selectedDepartamentoId)
    : funcionarios;

  // Quando selecionar um funcionário, preencher automaticamente a sala
  useEffect(() => {
    if (selectedFuncionarioId) {
      const funcionario = funcionarios.find(f => f.id.toString() === selectedFuncionarioId);
      if (funcionario && funcionario.sala) {
        setValue('sala', funcionario.sala);
      }
    }
  }, [selectedFuncionarioId, funcionarios, setValue]);

  // Adicionar equipamento à seleção
  const adicionarEquipamento = (equipamentoId) => {
    const equipamento = equipamentosDisponiveis.find(e => e.id.toString() === equipamentoId);
    if (equipamento && !selectedEquipamentos.some(e => e.id.toString() === equipamentoId)) {
      setSelectedEquipamentos(prev => [...prev, equipamento]);
    }
  };

  // Remover equipamento da seleção
  const removerEquipamento = (equipamentoId) => {
    setSelectedEquipamentos(prev =>
      prev.filter(e => e.id.toString() !== equipamentoId)
    );
  };

  // Limpar seleção de equipamentos
  const limparEquipamentosSelecionados = () => {
    setSelectedEquipamentos([]);
  };

  const handleCreate = () => {
    reset({
      departamento_id: '',
      funcionario_id: '',
      sala: '',
      data_atribuicao: new Date().toISOString().split('T')[0]
    });
    setAtribuicaoSelecionada(null);
    setShowModal(true);
  };

  const handleEditar = (grupo) => {
    const primeiraAtribuicao = filteredAtribuicoes.find(
      a => a.funcionario_id === grupo.funcionario_id
    );

    if (!primeiraAtribuicao) {
      toast.error('Não foi possível encontrar os dados para edição');
      return;
    }

    const dadosFuncionario = getDadosFuncionario(primeiraAtribuicao);

    const dadosFormulario = {
      funcionario_id: grupo.funcionario_id?.toString() || '',
      departamento_id: dadosFuncionario.funcionario?.departamento_id?.toString() || '',
      sala: dadosFuncionario.sala || '',
      data_atribuicao: grupo.data_atribuicao ?
        new Date(grupo.data_atribuicao).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0],
      observacoes: primeiraAtribuicao?.observacoes?.replace(/Atribuído para .+? - /, '') || ''
    };
    
    const equipamentosDoGrupo = grupo.equipamentos.map(eq =>
      equipamentos.find(equip => equip.id === eq.id)
    ).filter(Boolean);

    setSelectedEquipamentos(equipamentosDoGrupo);
    reset(dadosFormulario);
    setAtribuicaoSelecionada({
      ...grupo,
      tipo: 'grupo'
    });
    setShowModal(true);
  };

  const handleTransferir = (atribuicao) => {
    const funcionario = funcionarios.find(f =>
      f.id?.toString() === atribuicao.funcionario_id?.toString() ||
      f.id?.toString() === atribuicao.funcionario_id?.toString()
    );

    const departamento = funcionario ?
      departamentos.find(d => d.id?.toString() === funcionario.departamento_id?.toString()) :
      null;

    const atribuicaoComIds = {
      ...atribuicao,
      funcionario_id: funcionario?.id || atribuicao.funcionario_id,
      equipamento_id: atribuicao.equipamento_id,
      departamento_id: funcionario?.departamento_id || atribuicao.departamento_id,
      cargo: funcionario?.cargo || atribuicao.cargo,
      funcionario_nome: funcionario?.nome || atribuicao.funcionario_nome,
      funcionario_departamento: departamento?.nome || atribuicao.funcionario_departamento,
      funcionario_sala: funcionario?.sala || atribuicao.funcionario_sala,
      equipamento_modelo: atribuicao.equipamento_modelo,
      numero_serie: atribuicao.numero_serie
    };

    setAtribuicaoSelecionada(atribuicaoComIds);
    setShowTransferenciaModal(true);
  };

  // Abrir modal para devolução individual
  const handleDevolverIndividual = (equipamento, grupo) => {
    setEquipamentoParaDevolver(equipamento);
    setGrupoParaDevolver(grupo);
    setTipoDevolucao('individual');
    setShowDevolucaoModal(true);
  };

  // Abrir modal para devolução em lote
  const handleDevolverTodos = (grupo) => {
    setGrupoParaDevolver(grupo);
    setTipoDevolucao('todos');
    setShowDevolucaoModal(true);
  };

  // Executar a devolução
  const handleConfirmarDevolucao = async () => {
    if (!grupoParaDevolver) return;

    try {
      if (tipoDevolucao === 'individual' && equipamentoParaDevolver) {
        await atribuicoesService.devolver(equipamentoParaDevolver.atribuicao_id);
        toast.success(`Equipamento ${equipamentoParaDevolver.modelo} devolvido com sucesso!`);
      } else if (tipoDevolucao === 'todos') {
        const promises = grupoParaDevolver.equipamentos.map(equipamento =>
          atribuicoesService.devolver(equipamento.atribuicao_id)
        );
        await Promise.all(promises);
        toast.success(`Todos os ${grupoParaDevolver.equipamentos.length} equipamentos devolvidos com sucesso!`);
      }

      await loadAllData();
    } catch (error) {
      console.error('Erro na devolução:', error);
      toast.error('Erro ao devolver equipamento(s): ' + (error.response?.data?.message || error.message));
    } finally {
      setShowDevolucaoModal(false);
      setGrupoParaDevolver(null);
      setTipoDevolucao('');
      setEquipamentoParaDevolver(null);
    }
  };

  const handleTransferenciaSucesso = () => {
    loadAllData();
  };

  const onSubmit = async (data) => {
    try {
      if (atribuicaoSelecionada) {
        await Promise.all(
          selectedEquipamentos.map(async (equipamento) => {
            const atribuicaoData = {
              equipamento_id: equipamento.id,
              funcionario_id: parseInt(data.funcionario_id),
              data_atribuicao: data.data_atribuicao,
              observacoes: `Atribuído para ${data.sala} - ${data.observacoes || 'Sem observações'}`
            };

            await atribuicoesService.create(atribuicaoData);
          })
        );

        toast.success(`${selectedEquipamentos.length} equipamento(s) atribuído(s) com sucesso!`);
      } else {
        const promises = selectedEquipamentos.map(equipamento => {
          const atribuicaoData = {
            equipamento_id: equipamento.id,
            funcionario_id: parseInt(data.funcionario_id),
            data_atribuicao: data.data_atribuicao,
            observacoes: `Atribuído para ${data.sala} - ${data.observacoes || 'Sem observações'}`
          };

          return atribuicoesService.create(atribuicaoData);
        });

        await Promise.all(promises);
        toast.success(`${selectedEquipamentos.length} equipamento(s) atribuído(s) com sucesso!`);
      }

      setShowModal(false);
      setAtribuicaoSelecionada(null);
      setSelectedEquipamentos([]);
      await loadAllData();

    } catch (error) {
      toast.error('Erro ao criar atribuição: ' + error.response?.data?.message);
    }
  };

  // Modal específico para devolução
  const DevolucaoModal = () => {
    if (!grupoParaDevolver) return null;

    const isIndividual = tipoDevolucao === 'individual';
    const equipamento = equipamentoParaDevolver;

    return (
      <Modal
        isOpen={showDevolucaoModal}
        onClose={() => {
          setShowDevolucaoModal(false);
          setGrupoParaDevolver(null);
          setTipoDevolucao('');
          setEquipamentoParaDevolver(null);
        }}
        title={isIndividual ? "Devolver Equipamento" : "Devolver Todos os Equipamentos"}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900">Funcionário</h4>
            <p className="text-sm text-blue-700">
              {grupoParaDevolver.funcionario_nome} - {grupoParaDevolver.cargo}
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">
              {isIndividual ? 'Equipamento a Devolver' : 'Equipamentos a Devolver'}
            </h4>

            {isIndividual ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Modelo:</span>
                  <span className="text-sm">{equipamento.modelo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Número de Série:</span>
                  <span className="text-sm font-mono">{equipamento.numero_serie}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-yellow-700">
                  Serão devolvidos <strong>{grupoParaDevolver.equipamentos.length} equipamentos</strong>:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {grupoParaDevolver.equipamentos.map((eq) => (
                    <div key={eq.id} className="flex justify-between text-sm">
                      <span>{eq.modelo}</span>
                      <span className="font-mono text-xs">{eq.numero_serie}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {isIndividual
                ? 'Tem certeza que deseja devolver este equipamento?'
                : 'Tem certeza que deseja devolver todos os equipamentos?'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="flex justify-center space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDevolucaoModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="warning"
              onClick={handleConfirmarDevolucao}
            >
              {isIndividual ? 'Devolver Equipamento' : `Devolver Todos (${grupoParaDevolver.equipamentos.length})`}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atribuições</h1>
          <p className="text-gray-600">Gerir atribuição de equipamentos a funcionários</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Atribuição
        </Button>
      </div>

      {/* Filtros */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Atribuição
            </label>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="input flex-1"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
              >
                <option value="ativas">Atribuições Ativas</option>
                <option value="devolvidas">Devolvidas</option>
                <option value="todas">Todas as Atribuições</option>
              </select>
            </div>
          </div>

          {/* Filtro por funcionário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funcionário
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar por nome..."
                value={filtroFuncionario}
                onChange={(e) => setFiltroFuncionario(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por equipamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipamento
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar por modelo ou nº série..."
                value={filtroEquipamento}
                onChange={(e) => setFiltroEquipamento(e.target.value)}
              />
            </div>
          </div>

          {/* Botão para limpar filtros */}
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={limparFiltros}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Contadores de Status */}
        <div className="flex space-x-4 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">Ativas: {atribuicoesAtivas.length}</span>
          </span>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-600">Devolvidas: {atribuicoesDevolvidas.length}</span>
          </span>
          <span className="text-sm text-gray-600 ml-auto">
            <span className="font-semibold text-blue-600">
              Resultados: {filteredAtribuicoes.length}
            </span>
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Departamento</th>
              <th>Sala</th>
              <th>Data de Atribuição</th>
              <th>Data de Devolução</th>
              <th>Estado</th>
              <th>Equipamentos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData && currentData.length > 0 ? (
              currentData.map((grupo) => {
                const isAtivo = grupo.estado_entrega === 'Ativo';
                const grupoId = `${grupo.funcionario_id}-${grupo.funcionario_nome}`;
                const isExpanded = equipamentosExpandidos[grupoId];

                return (
                  <>
                    {/* Linha principal */}
                    <tr key={grupoId}>
                      <td>
                        <div>
                          <div className="font-medium">{grupo.funcionario_nome}</div>
                          <div className="text-sm text-gray-500">{grupo.cargo}</div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {grupo.departamento}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <DoorOpen className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {grupo.sala}
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(grupo.data_atribuicao)}</td>
                      <td>
                        {grupo.data_devolucao ? (
                          <span className="text-green-600 font-medium">
                            {formatDate(grupo.data_devolucao)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAtivo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {grupo.estado_entrega}
                          {!isAtivo && <CheckCircle className="w-3 h-3 ml-1" />}
                        </span>
                      </td>
                      <td>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEquipamentos(grupoId)}
                            className="flex items-center justify-center w-full"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            {isExpanded ? 'Ocultar Equipamentos' : 'Ver Equipamentos'}
                            <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                              {grupo.equipamentos.length}
                            </span>
                          </Button>
                          
                          {/* Ações de devolução quando expandido */}
                          {isExpanded && grupo.equipamentos.length > 1 && isAtivo && (
                            <button
                              onClick={() => handleDevolverTodos(grupo)}
                              className="text-xs font-medium text-orange-600 hover:text-orange-800 w-full text-center"
                              title="Devolver todos os equipamentos"
                            >
                              Devolver Todos
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          {isAtivo && (
                            <>
                              <button
                                onClick={() => handleEditar(grupo)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Editar Atribuição"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const primeiraAtribuicao = filteredAtribuicoes.find(
                                    a => a.funcionario_id === grupo.funcionario_id
                                  );
                                  if (primeiraAtribuicao) {
                                    handleTransferir(primeiraAtribuicao);
                                  }
                                }}
                                className="text-purple-600 hover:text-purple-900"
                                title="Transferir para outra sala"
                              >
                                <Move className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {!isAtivo && (
                            <span className="text-sm text-gray-400 px-2">
                              Devolvido
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Linha expandida com todos os equipamentos */}
                    {isExpanded && (
                      <tr className="bg-blue-50">
                        <td colSpan="8" className="p-4">
                          <div className="ml-4">
                            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                              <Package className="w-5 h-5 mr-2" />
                              Equipamentos de {grupo.funcionario_nome} ({grupo.equipamentos.length} no total)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {grupo.equipamentos.map((equipamento) => (
                                <div key={equipamento.id} className="bg-white p-3 rounded-lg border shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <div className="font-medium">{equipamento.modelo}</div>
                                      <div className="text-xs text-gray-500 font-mono">
                                        S/N: {equipamento.numero_serie}
                                      </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${equipamento.estado === 'Ativo'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                      }`}>
                                      {equipamento.estado}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div className="flex justify-between">
                                      <span>Atribuído em:</span>
                                      <span className="font-medium">{formatDate(equipamento.data_atribuicao)}</span>
                                    </div>
                                    {equipamento.data_devolucao && (
                                      <div className="flex justify-between">
                                        <span>Devolvido em:</span>
                                        <span className="font-medium text-green-600">{formatDate(equipamento.data_devolucao)}</span>
                                      </div>
                                    )}
                                  </div>
                                  {isAtivo && (
                                    <div className="mt-3 text-right">
                                      <button
                                        onClick={() => handleDevolverIndividual(equipamento, grupo)}
                                        className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                                      >
                                        Devolver este equipamento
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  Nenhuma atribuição encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Mensagem quando não há resultados */}
        {filteredAtribuicoes.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filtroFuncionario || filtroEquipamento 
                ? 'Nenhum resultado encontrado para os filtros aplicados'
                : filterTipo === 'ativas' && 'Nenhuma atribuição ativa'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtroFuncionario || filtroEquipamento 
                ? 'Tente ajustar os filtros ou limpar para ver todos os resultados'
                : filterTipo === 'ativas' && 'Todos os equipamentos estão devolvidos ou não há atribuições ativas no momento.'
              }
            </p>
            {(filtroFuncionario || filtroEquipamento) && (
              <Button
                variant="secondary"
                onClick={limparFiltros}
                className="mt-4"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Paginação MANUAL - AGORA FUNCIONANDO */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Modal de Nova Atribuição */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setAtribuicaoSelecionada(null);
          setSelectedEquipamentos([]);
        }}
        title={atribuicaoSelecionada ? "Editar Atribuição" : "Nova Atribuição"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {atribuicaoSelecionada && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Editando atribuição:</strong> {atribuicaoSelecionada.funcionario_nome}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Departamento *</label>
            <select
              {...register('departamento_id', { required: 'Departamento é obrigatório' })}
              className="input mt-1"
            >
              <option value="">Selecionar departamento</option>
              {departamentos.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.nome}
                </option>
              ))}
            </select>
            {errors.departamento_id && (
              <p className="mt-1 text-sm text-red-600">{errors.departamento_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Funcionário *</label>
            <select
              {...register('funcionario_id', { required: 'Funcionário é obrigatório' })}
              className="input mt-1"
              disabled={!selectedDepartamentoId}
            >
              <option value="">Selecionar funcionário</option>
              {funcionariosFiltrados.map(funcionario => (
                <option key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome} - {funcionario.cargo}
                </option>
              ))}
            </select>
            {errors.funcionario_id && (
              <p className="mt-1 text-sm text-red-600">{errors.funcionario_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sala *</label>
            <SalaSelect
              departamentoId={selectedDepartamentoId}
              value={watch('sala')}
              onChange={(e) => setValue('sala', e.target.value)}
              className="input mt-1"
            />
            {errors.sala && (
              <p className="mt-1 text-sm text-red-600">{errors.sala.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipamentos *
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Selecione um ou mais equipamentos)
              </span>
            </label>

            <div className="mb-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    adicionarEquipamento(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="input"
                disabled={equipamentosDisponiveis.length === 0}
              >
                <option value="">Selecionar equipamento para adicionar...</option>
                {equipamentosDisponiveis.map(equipamento => (
                  <option key={equipamento.id} value={equipamento.id}>
                    {equipamento.numero_serie} - {equipamento.modelo} ({equipamento.marca})
                  </option>
                ))}
              </select>
              {equipamentosDisponiveis.length === 0 && (
                <p className="text-sm text-yellow-600 mt-1">
                  Nenhum equipamento disponível para atribuição
                </p>
              )}
            </div>

            {selectedEquipamentos.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">
                    Equipamentos Selecionados ({selectedEquipamentos.length})
                  </h4>
                  <button
                    type="button"
                    onClick={limparEquipamentosSelecionados}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Limpar todos
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedEquipamentos.map((equipamento) => (
                    <div
                      key={equipamento.id}
                      className="flex items-center justify-between bg-white p-3 rounded border"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {equipamento.modelo}
                          <span className="text-xs text-gray-500 ml-2">
                            ({equipamento.marca})
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 font-mono">
                          S/N: {equipamento.numero_serie}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerEquipamento(equipamento.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Atribuição *</label>
              <input
                {...register('data_atribuicao', { required: 'Data de atribuição é obrigatória' })}
                type="date"
                className="input mt-1"
              />
              {errors.data_atribuicao && (
                <p className="mt-1 text-sm text-red-600">{errors.data_atribuicao.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              {...register('observacoes')}
              rows={3}
              className="input mt-1"
              placeholder="Observações sobre a atribuição..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setAtribuicaoSelecionada(null);
                setSelectedEquipamentos([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={selectedEquipamentos.length === 0}
            >
              {atribuicaoSelecionada ? 'Atualizar' : 'Criar'} Atribuição
              {selectedEquipamentos.length > 0 && ` (${selectedEquipamentos.length} equipamentos)`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Transferência entre Salas */}
      <TransferenciaSalaModal
        isOpen={showTransferenciaModal}
        onClose={() => {
          setShowTransferenciaModal(false);
          setAtribuicaoSelecionada(null);
        }}
        atribuicao={atribuicaoSelecionada}
        onTransferenciaSucesso={handleTransferenciaSucesso}
        funcionarios={funcionarios}
        departamentos={departamentos}
      />
      <DevolucaoModal />
    </div>
  );
};