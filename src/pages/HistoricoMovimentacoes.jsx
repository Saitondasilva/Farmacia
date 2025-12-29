import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Monitor, Building, X, FileText } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Pagination } from '../components/ui/Pagination';
import { usePagination } from '../hooks/usePagination';
import { historicoMovimentacoesService } from '../services/historicoMovimentacoesService';
import { format } from 'date-fns';

export const HistoricoMovimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todas');
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const loadMovimentacoes = async () => {
    try {
      const response = await historicoMovimentacoesService.getAll();
      const dados = response?.data ?? response ?? [];
      setMovimentacoes(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setMovimentacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setFilterTipo('todas');
  };

  const normalizarMovimentacao = (mov) => ({
    id: mov.id,
    funcionario_id: mov.funcionario_id,
    equipamento_id: mov.equipamento_id,
    departamento_origem_id: mov.departamento_origem_id,
    departamento_destino_id: mov.departamento_destino_id,
    sala_origem: mov.sala_origem,
    sala_destino: mov.sala_destino,
    data_movimentacao: mov.data_movimentacao,
    observacoes: mov.observacoes,
    funcionario_nome: mov.funcionario_nome || 'Nome não disponível',
    equipamento_modelo: mov.equipamento_modelo || 'Modelo não disponível',
    numero_serie: mov.numero_serie || mov.equipamento_numero_serie || 'N/S não disponível',
    departamento_origem_nome: mov.departamento_origem_nome,
    departamento_destino_nome: mov.departamento_destino_nome || 'Departamento destino não disponível'
  });

  const filteredMovimentacoes = movimentacoes
    .map(normalizarMovimentacao)
    .filter(mov => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        mov.funcionario_nome.toLowerCase().includes(searchLower) ||
        mov.equipamento_modelo.toLowerCase().includes(searchLower) ||
        mov.numero_serie.toLowerCase().includes(searchLower) ||
        (mov.departamento_origem_nome && mov.departamento_origem_nome.toLowerCase().includes(searchLower)) ||
        mov.departamento_destino_nome.toLowerCase().includes(searchLower);

      let matchesFilter = true;

      if (filterTipo === 'com_transferencia') {
        // Apenas transferências entre departamentos diferentes
        matchesFilter = mov.departamento_origem_nome != null &&
          mov.departamento_destino_nome != null &&
          mov.departamento_origem_id !== mov.departamento_destino_id;
      } else if (filterTipo === 'sem_transferencia') {
        // Atribuições iniciais OU movimentações dentro do mesmo departamento
        matchesFilter = mov.departamento_origem_nome == null ||
          mov.departamento_origem_id === mov.departamento_destino_id;
      }

      return matchesSearch && matchesFilter;
    });


  const pagination = usePagination(filteredMovimentacoes, itemsPerPage);

  useEffect(() => {
    loadMovimentacoes();
  }, []);

  useEffect(() => {
    pagination.setCurrentPage(1);
  }, [searchTerm, filterTipo]);

  const getTipoMovimentacao = (mov) => {
    if (mov.departamento_origem_nome != null && mov.departamento_origem_id !== mov.departamento_destino_id) {
      return 'Transferência';
    }
    return 'Atribuição Inicial';
  };

  const getColorTipo = (mov) => {
    if (mov.departamento_origem_nome != null && mov.departamento_origem_id !== mov.departamento_destino_id) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const filtrosAtivos = searchTerm || filterTipo !== 'todas';

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
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Movimentações</h1>
          <p className="text-gray-600">
            {movimentacoes.length > 0
              ? `${movimentacoes.length} movimentações registradas • ${filteredMovimentacoes.length} após filtros`
              : 'Registro completo de todas as movimentações de equipamentos'
            }
          </p>
        </div>

        <div className="flex gap-3">
          {filtrosAtivos && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar por funcionário, equipamento ou número de série..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                className="input"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
              >
                <option value="todas">Todas as movimentações</option>
                <option value="com_transferencia">Apenas transferências</option>
                <option value="sem_transferencia">Apenas atribuições</option>
              </select>
            </div>
          </div>
          <div className="sm:w-32">
            <select
              className="input"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>

        {filtrosAtivos && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Pesquisa: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterTipo !== 'todas' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Filtro: {filterTipo === 'com_transferencia' ? 'Apenas transferências' : 'Apenas atribuições'}
                <button
                  onClick={() => setFilterTipo('todas')}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabela de Movimentações */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Funcionário</th>
              <th>Equipamento</th>
              <th>Departamento/Sala Origem</th>
              <th>Departamento/Sala Destino</th>
              <th>Tipo</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pagination.currentData.map((mov) => {
              const movNormalizada = normalizarMovimentacao(mov);
              return (
                <tr key={movNormalizada.id}>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {format(new Date(movNormalizada.data_movimentacao), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="font-medium">{movNormalizada.funcionario_nome}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{movNormalizada.equipamento_modelo}</div>
                        <div className="text-sm text-gray-500 font-mono">{movNormalizada.numero_serie}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {movNormalizada.departamento_origem_nome ? (
                      <div>
                        <div className="font-medium">{movNormalizada.departamento_origem_nome}</div>
                        <div className="text-sm text-gray-500">{movNormalizada.sala_origem}</div>
                        <div className="text-xs text-gray-500">
                          {movNormalizada.departamento_origem_id === movNormalizada.departamento_destino_id
                            ? '(Mesmo departamento)'
                            : `ID: ${movNormalizada.departamento_origem_id}`
                          }
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>
                    <div>
                      <div className="font-medium">{movNormalizada.departamento_destino_nome}</div>
                      <div className="text-sm text-gray-500">{movNormalizada.sala_destino}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorTipo(movNormalizada)}`}>
                      {getTipoMovimentacao(movNormalizada)}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-500">
                      {movNormalizada.observacoes || '-'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pagination.totalItems === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filtrosAtivos
                ? 'Nenhuma movimentação encontrada'
                : 'Nenhuma movimentação registrada'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtrosAtivos
                ? 'Tente alterar os termos de pesquisa.'
                : 'As movimentações aparecerão aqui automaticamente.'
              }
            </p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={pagination.goToPage}
        />
      )}
    </div>
  );
};