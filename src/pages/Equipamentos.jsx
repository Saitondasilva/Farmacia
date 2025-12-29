import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Monitor, Filter, Download, FileText, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Pagination } from '../components/ui/Pagination';
import { ItemsPerPage } from '../components/ui/ItemsPerPage';
import { usePagination } from '../hooks/usePagination';
import { equipamentosService } from '../services/equipamentosService';
import { categoriasService } from '../services/categoriasService';
import { fornecedoresService } from '../services/fornecedoresService';
import { atribuicoesService } from '../services/atribuicoesService';
import { funcionariosService } from '../services/funcionariosService';
import { departamentosService } from '../services/departamentosService';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import 'jspdf-autotable';

const estados = ['Disponível', 'Em Uso', 'Em Manutenção', 'Descartado'];

export const Equipamentos = () => {
  const [equipamentos, setEquipamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [atribuicoesAtivas, setAtribuicoesAtivas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('tabela');
  const [exportLoading, setExportLoading] = useState(false);
  const [showNovaMarca, setShowNovaMarca] = useState(false);
  const [novaMarca, setNovaMarca] = useState('');
  const [marcasLoading, setMarcasLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  // Watch para o campo marca_id
  const marcaIdSelecionada = watch('marca_id');

  useEffect(() => {
    loadData();
    loadMarcas();
  }, []);

  // Efeito para preencher o campo 'marca' quando uma marca existente é selecionada
  useEffect(() => {
    if (marcaIdSelecionada && !showNovaMarca) {
      const marcaSelecionada = marcas.find(m => m.id === parseInt(marcaIdSelecionada));
      if (marcaSelecionada) {
        setValue('marca', marcaSelecionada.descricao);
      }
    }
  }, [marcaIdSelecionada, showNovaMarca, marcas, setValue]);

  const loadData = async () => {
    try {
      const [
        equipamentosRes,
        categoriasRes,
        fornecedoresRes,
        funcionariosRes,
        departamentosRes,
        atribuicoesRes
      ] = await Promise.all([
        equipamentosService.getAll(),
        categoriasService.getAll(),
        fornecedoresService.getAll(),
        funcionariosService.getAll(),
        departamentosService.getAll(),
        atribuicoesService.getAtivas()
      ]);

      setEquipamentos(equipamentosRes.data || []);
      setCategorias(categoriasRes.data || []);
      setFornecedores(fornecedoresRes.data || []);
      setFuncionarios(funcionariosRes.data || []);
      setDepartamentos(departamentosRes.data || []);
      setAtribuicoesAtivas(Array.isArray(atribuicoesRes) ? atribuicoesRes : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setEquipamentos([]);
      setCategorias([]);
      setFornecedores([]);
      setFuncionarios([]);
      setDepartamentos([]);
      setAtribuicoesAtivas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMarcas = async () => {
    try {
      setMarcasLoading(true);
      const marcasRes = await equipamentosService.getAllMarcas();
      setMarcas(marcasRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
      setMarcas([]);
      toast.error('Erro ao carregar lista de marcas');
    } finally {
      setMarcasLoading(false);
    }
  };

  // Função para criar uma nova marca
  const criarNovaMarca = async () => {
    if (!novaMarca.trim()) {
      toast.error('Digite um nome para a nova marca');
      return null;
    }

    try {
      setMarcasLoading(true);
      const response = await equipamentosService.createMarca({
        descricao: novaMarca.trim()
      });
      
      if (response && response.data) {
        toast.success(`Marca "${novaMarca}" criada com sucesso!`);
        // Atualizar lista de marcas
        await loadMarcas();
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao criar marca:', error);
      toast.error('Erro ao criar marca: ' + (error.response?.data?.error || error.message));
      return null;
    } finally {
      setMarcasLoading(false);
    }
  };

  // Função para obter dados do funcionário de um equipamento específico
  const getDadosFuncionarioPorEquipamento = (equipamentoId) => {
    if (!equipamentoId || !Array.isArray(atribuicoesAtivas) || atribuicoesAtivas.length === 0) {
      return {
        funcionarioNome: 'Não atribuído',
        departamentoNome: 'Não atribuído',
        sala: '-'
      };
    }

    const atribuicao = atribuicoesAtivas.find(atrib =>
      atrib && atrib.equipamento_id?.toString() === equipamentoId?.toString()
    );

    if (!atribuicao) {
      return {
        funcionarioNome: 'Não atribuído',
        departamentoNome: 'Não atribuído',
        sala: '-'
      };
    }

    let funcionario = null;

    if (atribuicao.funcionario_id) {
      funcionario = funcionarios.find(f =>
        f && f.id?.toString() === atribuicao.funcionario_id?.toString()
      );
    }

    if (!funcionario && atribuicao.funcionario_nome) {
      funcionario = funcionarios.find(f =>
        f && f.nome?.trim().toLowerCase() === atribuicao.funcionario_nome?.trim().toLowerCase()
      );
    }

    if (!funcionario) {
      return {
        funcionarioNome: atribuicao.funcionario_nome || 'Funcionário não encontrado',
        departamentoNome: atribuicao.departamento || 'Não atribuído',
        sala: atribuicao.sala || '-'
      };
    }

    let departamento = null;
    if (funcionario.departamento_id) {
      departamento = departamentos.find(d =>
        d && d.id?.toString() === funcionario.departamento_id?.toString()
      );
    }

    return {
      funcionarioNome: funcionario.nome || atribuicao.funcionario_nome || 'Nome não disponível',
      departamentoNome: departamento?.nome || atribuicao.departamento || 'Departamento não atribuído',
      sala: funcionario.sala || atribuicao.sala || '-'
    };
  };

  // Função para gerar dados para exportação
  const gerarDadosParaExportacao = () => {
    return equipamentos.map(equipamento => {
      const dadosFuncionario = getDadosFuncionarioPorEquipamento(equipamento.id);

      return {
        'Nome do Equipamento': equipamento.nome_equi || 'Não especificado',
        'Marca': equipamento.marca || 'Não especificado',
        'Modelo': equipamento.modelo || 'Não especificado',
        'Número de Série': equipamento.numero_serie || 'Não especificado',
        'Categoria': equipamento.categoria_nome || 'Não especificado',
        'Funcionário': dadosFuncionario.funcionarioNome,
        'Departamento': dadosFuncionario.departamentoNome,
        'Sala': dadosFuncionario.sala,
        'Estado': equipamento.estado || 'Desconhecido',
        'Fornecedor': equipamento.fornecedor_nome || 'Não especificado',
        'Data de Aquisição': equipamento.data_aquisicao || 'Não especificado',
        'Data de Garantia': equipamento.garantia || 'Não especificado',
        'Preço de Aquisição': equipamento.preco_aquisicao
          ? `STN ${parseFloat(equipamento.preco_aquisicao).toLocaleString('pt-PT')}`
          : 'Não especificado',
        'Especificações Técnicas': equipamento.especificacoes_tecnicas || 'Não especificado'
      };
    });
  };

  // Função para exportar para CSV
  const exportarParaCSV = () => {
    setExportLoading(true);
    try {
      const dados = gerarDadosParaExportacao();

      // Cabeçalhos
      const cabecalhos = Object.keys(dados[0] || {});

      // Linhas de dados
      const linhas = dados.map(objeto =>
        cabecalhos.map(cabecalho => {
          let valor = objeto[cabecalho];
          // Tratar strings que podem conter vírgulas
          if (typeof valor === 'string' && valor.includes(',')) {
            return `"${valor}"`;
          }
          return valor;
        }).join(',')
      );

      // Combinar cabeçalhos e linhas
      const csvContent = [
        cabecalhos.join(','),
        ...linhas
      ].join('\n');

      // Criar blob e download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `equipamentos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Relatório CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar relatório CSV');
    } finally {
      setExportLoading(false);
    }
  };

  // Função para exportar PDF formatado (alternativa mais detalhada)
  const exportarPDFDetalhado = async () => {
    setExportLoading(true);
    try {
      const dados = gerarDadosParaExportacao();

      if (dados.length === 0) {
        toast.warning('Não há dados para exportar');
        setExportLoading(false);
        return;
      }

      // Importar jsPDF e autoTable
      const jsPDF = (await import('jspdf')).default;
      const autoTableModule = (await import('jspdf-autotable')).default;

      // Criar documento em landscape
      const doc = new jsPDF('landscape');

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Cabeçalho estilizado
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('RELATÓRIO COMPLETO DE EQUIPAMENTOS', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`Sistema de Gestão de Equipamentos - ${new Date().toLocaleDateString('pt-PT')}`, pageWidth / 2, 30, { align: 'center' });

      // Informações do relatório
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, 50, pageWidth - (margin * 2), 20, 'F');

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de Equipamentos: ${dados.length}`, margin + 10, 60);
      doc.text(`Data de Geração: ${new Date().toLocaleString('pt-PT')}`, pageWidth - margin - 100, 60);

      // Tabela principal
      const cabecalhos = [
        ['Nº', 'Nome Equipamento', 'Marca', 'Modelo', 'Nº Série', 'Categoria', 'Funcionário', 'Departamento', 'Sala', 'Estado']
      ];

      const dadosTabela = dados.map((item, index) => [
        index + 1,
        item['Nome do Equipamento'],
        item['Marca'],
        item['Modelo'],
        item['Número de Série'],
        item['Categoria'],
        item['Funcionário'],
        item['Departamento'],
        item['Sala'],
        item['Estado']
      ]);

      // Usar autoTable
      if (typeof autoTableModule === 'function') {
        // Usar como função standalone
        autoTableModule(doc, {
          head: cabecalhos,
          body: dadosTabela,
          startY: 75,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: {
            fontSize: 7,
            cellPadding: 1,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            textColor: [50, 50, 50]
          },
          alternateRowStyles: {
            fillColor: [248, 248, 248]
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' }, // Nº
            1: { cellWidth: 25 }, // Nome
            2: { cellWidth: 15 }, // Marca
            3: { cellWidth: 18 }, // Modelo
            4: { cellWidth: 22 }, // Nº Série
            5: { cellWidth: 20 }, // Categoria
            6: { cellWidth: 25 }, // Funcionário
            7: { cellWidth: 22 }, // Departamento
            8: { cellWidth: 15 }, // Sala
            9: { cellWidth: 15, halign: 'center' } // Estado
          }
        });
      } else {
        // Usar como plugin
        doc.autoTable({
          head: cabecalhos,
          body: dadosTabela,
          startY: 75,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: {
            fontSize: 7,
            cellPadding: 1,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            textColor: [50, 50, 50]
          },
          alternateRowStyles: {
            fillColor: [248, 248, 248]
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' }, // Nº
            1: { cellWidth: 25 }, // Nome
            2: { cellWidth: 15 }, // Marca
            3: { cellWidth: 18 }, // Modelo
            4: { cellWidth: 22 }, // Nº Série
            5: { cellWidth: 20 }, // Categoria
            6: { cellWidth: 25 }, // Funcionário
            7: { cellWidth: 22 }, // Departamento
            8: { cellWidth: 15 }, // Sala
            9: { cellWidth: 15, halign: 'center' } // Estado
          }
        });
      }

      // Resumo por categoria
      const resumoPorCategoria = {};
      dados.forEach(item => {
        const categoria = item['Categoria'];
        resumoPorCategoria[categoria] = (resumoPorCategoria[categoria] || 0) + 1;
      });

      // Resumo por estado
      const resumoPorEstado = {};
      dados.forEach(item => {
        const estado = item['Estado'];
        resumoPorEstado[estado] = (resumoPorEstado[estado] || 0) + 1;
      });

      const finalY = doc.lastAutoTable?.finalY + 10 || 80;

      // Adicionar seções de resumo
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.text('RESUMOS', margin, finalY);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // Coluna esquerda - Resumo por categoria
      doc.text('Por Categoria:', margin, finalY + 15);
      let yCategoria = finalY + 22;
      Object.entries(resumoPorCategoria).forEach(([categoria, quantidade]) => {
        doc.text(`• ${categoria}: ${quantidade}`, margin + 5, yCategoria);
        yCategoria += 6;
      });

      // Coluna direita - Resumo por estado
      doc.text('Por Estado:', pageWidth / 2, finalY + 15);
      let yEstado = finalY + 22;
      Object.entries(resumoPorEstado).forEach(([estado, quantidade]) => {
        doc.text(`• ${estado}: ${quantidade}`, pageWidth / 2 + 5, yEstado);
        yEstado += 6;
      });

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'Relatório gerado pelo Sistema de Gestão de Equipamentos - Confidencial',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Adicionar número de páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
      }

      doc.save(`relatorio_detalhado_equipamentos_${new Date().toISOString().split('T')[0]}.pdf`);

      toast.success('Relatório PDF detalhado exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF detalhado:', error);
      toast.error('Erro ao exportar relatório PDF detalhado');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredEquipamentos = equipamentos.filter(equipamento => {
    if (!equipamento) return false;

    const matchesSearch =
      (equipamento.numero_serie && equipamento.numero_serie.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (equipamento.modelo && equipamento.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (equipamento.marca && equipamento.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (equipamento.nome_equi && equipamento.nome_equi.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEstado = !filterEstado || equipamento.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  // Agrupar equipamentos por categoria e marca
  const equipamentosPorCategoria = filteredEquipamentos.reduce((acc, equipamento) => {
    if (!equipamento) return acc;

    const categoria = equipamento.categoria_nome || 'Sem Categoria';
    const marca = equipamento.marca || 'Sem Marca';

    if (!acc[categoria]) {
      acc[categoria] = {};
    }

    if (!acc[categoria][marca]) {
      acc[categoria][marca] = [];
    }

    acc[categoria][marca].push(equipamento);
    return acc;
  }, {});

  // Usar hook de paginação
  const pagination = usePagination(filteredEquipamentos, itemsPerPage);

  // Resetar para primeira página quando filtrar
  useEffect(() => {
    pagination.setCurrentPage(1);
  }, [searchTerm, filterEstado]);

  const handleCreate = () => {
    setEditingEquipamento(null);
    setShowNovaMarca(false);
    setNovaMarca('');
    reset();
    setShowModal(true);
  };

  const handleEdit = (equipamento) => {
    setEditingEquipamento(equipamento);
    setShowNovaMarca(false);
    setNovaMarca('');
    reset(equipamento);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja eliminar este equipamento?')) return;

    try {
      await equipamentosService.delete(id);
      await loadData();
    } catch (error) {
      alert('Erro ao eliminar equipamento: ' + error.response?.data?.message);
    }
  };

  const onSubmit = async (data) => {
    try {
      let marcaId = data.marca_id;
      let marcaTexto = data.marca;

      // Se o usuário está criando uma nova marca
      if (showNovaMarca && novaMarca.trim()) {
        // Criar nova marca no banco
        const novaMarcaCriada = await criarNovaMarca();
        
        if (novaMarcaCriada && novaMarcaCriada.id) {
          marcaId = novaMarcaCriada.id;
          marcaTexto = novaMarca.trim();
        } else {
          throw new Error('Não foi possível criar a nova marca');
        }
      } else if (marcaId) {
        // Usar marca existente - obter o texto da marca
        const marcaSelecionada = marcas.find(m => m.id === parseInt(marcaId));
        if (marcaSelecionada) {
          marcaTexto = marcaSelecionada.descricao;
        }
      }

      // Preparar dados para envio
      const equipamentoData = {
        ...data,
        marca_id: marcaId,
        marca: marcaTexto
      };

      let result;

      if (editingEquipamento) {
        result = await equipamentosService.update(editingEquipamento.id, equipamentoData);
        const updatedId = editingEquipamento.id;
        console.log('Equipamento atualizado com ID:', updatedId);
        toast.success(`Equipamento atualizado com ID: ${updatedId}`);
      } else {
        result = await equipamentosService.create(equipamentoData);
        const newId = result?.id;
        toast.success(`Novo equipamento criado${newId ? ` (ID: ${newId})` : ''}`);
      }

      setShowModal(false);
      setShowNovaMarca(false);
      setNovaMarca('');
      await loadData();

    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
      toast.error('Erro ao salvar equipamento: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowNovaMarca(false);
    setNovaMarca('');
    reset();
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'Disponível': 'bg-green-100 text-green-800',
      'Em Uso': 'bg-blue-100 text-blue-800',
      'Em Manutenção': 'bg-yellow-100 text-yellow-800',
      'Descartado': 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
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
      {/* Cabeçalho e Botões */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
          <p className="text-gray-600">Gerir equipamentos informáticos</p>
        </div>
        <div className="flex space-x-3">
          {/* Botão de Visualização */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('tabela')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'tabela'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Tabela
            </button>
            <button
              onClick={() => setViewMode('categoria')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'categoria'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Por Categoria
            </button>
          </div>

          {/* Dropdown para exportação */}
          <div className="relative group">
            <Button
              variant="outline"
              className="flex items-center"
              disabled={exportLoading || equipamentos.length === 0}
            >
              {exportLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exportar
              {equipamentos.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {equipamentos.length}
                </span>
              )}
            </Button>

            {/* Menu dropdown de exportação */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={exportarParaCSV}
                  disabled={exportLoading || equipamentos.length === 0}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                  Exportar para CSV
                </button>
                <button
                  onClick={exportarPDFDetalhado}
                  disabled={exportLoading || equipamentos.length === 0}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Exportar para PDF
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Equipamento
          </Button>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar por número de série, modelo ou marca..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="input"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos os estados</option>
              {estados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Controlos de Paginação Superiores */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <ItemsPerPage
          value={itemsPerPage}
          onChange={setItemsPerPage}
        />

        <div className="text-sm text-gray-700">
          {pagination.totalItems > 0 ? (
            <>Mostrando {pagination.currentData.length} de {pagination.totalItems} equipamentos</>
          ) : (
            <>Nenhum equipamento encontrado</>
          )}
        </div>
      </div>

      {/* Visualização por Tabela */}
      {viewMode === 'tabela' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº Série</th>
                <th>Modelo</th>
                <th>Marca</th>
                <th>Nome Equipamento</th>
                <th>Categoria</th>
                <th>Funcionário</th>
                <th>Departamento</th>
                <th>Sala</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagination.currentData.map((equipamento) => {
                if (!equipamento) return null;

                const dadosFuncionario = getDadosFuncionarioPorEquipamento(equipamento.id);

                return (
                  <tr key={equipamento.id}>
                    <td className="font-mono text-sm">{equipamento.numero_serie || '-'}</td>
                    <td>{equipamento.modelo || '-'}</td>
                    <td>{equipamento.marca || '-'}</td>
                    <td>{equipamento.nome_equi || '-'}</td>
                    <td>{equipamento.categoria_nome || '-'}</td>
                    <td>
                      {dadosFuncionario.funcionarioNome}
                    </td>
                    <td>
                      {dadosFuncionario.departamentoNome}
                    </td>
                    <td>
                      {dadosFuncionario.sala}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(equipamento.estado)}`}>
                        {equipamento.estado || 'Desconhecido'}
                      </span>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(equipamento)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(equipamento.id)}
                          className="text-red-600 hover:text-red-900"
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

          {pagination.totalItems === 0 && (
            <div className="text-center py-12">
              <Monitor className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum equipamento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterEstado ? 'Tente alterar os filtros de pesquisa.' : 'Comece por adicionar um novo equipamento.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Visualização por Categoria/Marca */}
      {viewMode === 'categoria' && (
        <div className="space-y-6">
          {Object.keys(equipamentosPorCategoria).length > 0 ? (
            Object.entries(equipamentosPorCategoria).map(([categoria, marcas]) => (
              <div key={categoria} className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{categoria}</h3>
                  <p className="text-sm text-gray-600">
                    Total: {Object.values(marcas).flat().length} equipamentos
                  </p>
                </div>

                {Object.entries(marcas).map(([marca, equipamentosMarca]) => (
                  <div key={marca} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-6 py-3 bg-gray-50">
                      <h4 className="font-medium text-gray-900">{marca}</h4>
                      <p className="text-sm text-gray-600">
                        {equipamentosMarca.length} equipamentos
                      </p>
                    </div>

                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {equipamentosMarca.map((equipamento) => {
                          if (!equipamento) return null;

                          const dadosFuncionario = getDadosFuncionarioPorEquipamento(equipamento.id);

                          return (
                            <div key={equipamento.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-medium text-gray-900">{equipamento.modelo || 'Sem modelo'}</h5>
                                  <p className="text-sm text-gray-500 font-mono">{equipamento.numero_serie || 'Sem número de série'}</p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(equipamento.estado)}`}>
                                  {equipamento.estado || 'Desconhecido'}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Fornecedor: {equipamento.fornecedor_nome || 'Não especificado'}</p>
                                {equipamento.preco_aquisicao && (
                                  <p>Preço: STN {parseFloat(equipamento.preco_aquisicao).toLocaleString('pt-PT')}</p>
                                )}

                                {/* Informações do Funcionário/Departamento/Sala */}
                                {dadosFuncionario.funcionarioNome !== 'Não atribuído' ? (
                                  <>
                                    <p>Funcionário: {dadosFuncionario.funcionarioNome}</p>
                                    <p>Departamento: {dadosFuncionario.departamentoNome}</p>
                                    <p>Sala: {dadosFuncionario.sala}</p>
                                  </>
                                ) : (
                                  <p className="text-gray-400 italic">Não atribuído</p>
                                )}
                              </div>

                              <div className="flex space-x-2 mt-3">
                                <button
                                  onClick={() => handleEdit(equipamento)}
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  <Edit className="w-4 h-4 inline mr-1" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(equipamento.id)}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  <Trash2 className="w-4 h-4 inline mr-1" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Monitor className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum equipamento encontrado</h3>
            </div>
          )}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={pagination.goToPage}
        />
      )}

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingEquipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {editingEquipamento && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>ID do Equipamento:</strong> #{editingEquipamento.id}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Série *</label>
              <input
                {...register('numero_serie', { required: 'Número de série é obrigatório' })}
                type="text"
                className="input mt-1"
              />
              {errors.numero_serie && (
                <p className="mt-1 text-sm text-red-600">{errors.numero_serie.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Modelo *</label>
              <input
                {...register('modelo', { required: 'Modelo é obrigatório' })}
                type="text"
                className="input mt-1"
              />
              {errors.modelo && (
                <p className="mt-1 text-sm text-red-600">{errors.modelo.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nome do Equipamento *</label>
              <input
                {...register('nome_equi', { required: 'Nome do equipamento é obrigatório' })}
                type="text"
                className="input mt-1"
              />
              {errors.nome_equi && (
                <p className="mt-1 text-sm text-red-600">{errors.nome_equi.message}</p>
              )}
            </div>

            {/* CAMPO DE MARCA COM OPÇÃO DE CRIAR NOVA */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Marca *</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowNovaMarca(!showNovaMarca);
                    if (showNovaMarca) {
                      // Se estiver voltando para seleção, limpar o campo de nova marca
                      setNovaMarca('');
                      setValue('marca_id', '');
                      setValue('marca', '');
                    } else {
                      // Se estiver indo para criar nova marca, limpar o select
                      setValue('marca_id', '');
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showNovaMarca ? (
                    <>
                      <X className="w-3 h-3" />
                      Selecionar marca existente
                    </>
                  ) : (
                    'Criar nova marca'
                  )}
                </button>
              </div>
              
              {showNovaMarca ? (
                // Opção para criar nova marca
                <div className="space-y-2">
                  <input
                    type="text"
                    value={novaMarca}
                    onChange={(e) => {
                      setNovaMarca(e.target.value);
                      setValue('marca', e.target.value);
                    }}
                    placeholder="Digite o nome da nova marca"
                    className="input mt-1"
                    disabled={marcasLoading}
                  />
                  <input type="hidden" {...register('marca_id')} />
                  {marcasLoading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Criando marca...
                    </div>
                  )}
                </div>
              ) : (
                // Opção para selecionar marca existente
                <div className="space-y-2">
                  <select
                    {...register('marca_id', { 
                      required: !showNovaMarca && 'Marca é obrigatória' 
                    })}
                    className="input mt-1"
                    disabled={marcasLoading}
                  >
                    <option value="">Selecionar marca</option>
                    {marcas.map(marca => (
                      <option key={marca.id} value={marca.id}>
                        {marca.descricao}
                      </option>
                    ))}
                  </select>
                  {marcasLoading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Carregando marcas...
                    </div>
                  )}
                </div>
              )}
              
              {/* Campo oculto para o texto da marca */}
              <input type="hidden" {...register('marca', { required: 'Marca é obrigatória' })} />
              
              {errors.marca_id && !showNovaMarca && (
                <p className="mt-1 text-sm text-red-600">{errors.marca_id.message}</p>
              )}
              {errors.marca && showNovaMarca && (
                <p className="mt-1 text-sm text-red-600">{errors.marca.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoria *</label>
              <select
                {...register('categoria_id', { required: 'Categoria é obrigatória' })}
                className="input mt-1"
              >
                <option value="">Selecionar categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {errors.categoria_id && (
                <p className="mt-1 text-sm text-red-600">{errors.categoria_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fornecedor *</label>
              <select
                {...register('fornecedor_id', { required: 'Fornecedor é obrigatório' })}
                className="input mt-1"
              >
                <option value="">Selecionar fornecedor</option>
                {fornecedores.map(fornecedor => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
              {errors.fornecedor_id && (
                <p className="mt-1 text-sm text-red-600">{errors.fornecedor_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Aquisição *</label>
              <input
                {...register('data_aquisicao', { required: 'Data de aquisição é obrigatória' })}
                type="date"
                className="input mt-1"
              />
              {errors.data_aquisicao && (
                <p className="mt-1 text-sm text-red-600">{errors.data_aquisicao.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Garantia</label>
              <input
                {...register('garantia')}
                type="date"
                className="input mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preço de Aquisição</label>
              <input
                {...register('preco_aquisicao')}
                type="number"
                step="0.01"
                className="input mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                {...register('estado')}
                className="input mt-1"
              >
                {estados.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Especificações Técnicas</label>
              <textarea
                {...register('especificacoes_tecnicas')}
                rows={3}
                className="input mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={marcasLoading}>
              {editingEquipamento ? 'Atualizar' : 'Criar'} Equipamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};