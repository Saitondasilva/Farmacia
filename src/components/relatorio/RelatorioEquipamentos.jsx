import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Users, PieChart } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const RelatorioEquipamentos = ({ dados, filtros }) => {
  if (!dados) return <LoadingSpinner />;
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  // MEMOIZAR filtragem para NÃO criar um novo array a cada render
  const equipamentosFiltrados = useMemo(() => {
    return dados.filter(equip => {
      let passaFiltro = true;

      if (filtros.categoria && equip.categoria_id) {
        passaFiltro =
          passaFiltro &&
          equip.categoria_id.toString() === filtros.categoria.toString();
      }

      if (filtros.estado) {
        passaFiltro = passaFiltro && equip.estado === filtros.estado;
      }

      if (filtros.localizacao && equip.localizacao) {
        passaFiltro =
          passaFiltro &&
          equip.localizacao.toString() === filtros.localizacao.toString();
      }

      return passaFiltro;
    });
    // dependências: recalcula apenas quando dados OU filtros relevantes mudarem
  }, [dados, filtros.categoria, filtros.estado, filtros.localizacao]);

  const totalPaginas = Math.max(1, Math.ceil(equipamentosFiltrados.length / itensPorPagina));

  const equipamentosPorCategoria = useMemo(() => {
    return equipamentosFiltrados.reduce((acc, eq) => {
      const categoria = eq.categoria_nome || "Sem Categoria";
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});
  }, [equipamentosFiltrados]);

  const equipamentosPorEstado = useMemo(() => {
    return equipamentosFiltrados.reduce((acc, eq) => {
      acc[eq.estado] = (acc[eq.estado] || 0) + 1;
      return acc;
    }, {});
  }, [equipamentosFiltrados]);

  // PAGINAÇÃO: equipamentos visíveis para a página atual
  const equipamentosPaginados = useMemo(() => {
    const indexInicial = (paginaAtual - 1) * itensPorPagina;
    const indexFinal = indexInicial + itensPorPagina;
    return equipamentosFiltrados.slice(indexInicial, indexFinal);
  }, [equipamentosFiltrados, paginaAtual]);

  // Resetar página quando filtros (ou dados) mudarem — usamos as mesmas deps do useMemo acima
  useEffect(() => {
    setPaginaAtual(1);
  }, [dados, filtros.categoria, filtros.estado, filtros.localizacao]);

  return (
    <div className="space-y-6">
      {/* Indicador de filtros ativos */}
      {(filtros.categoria || filtros.estado || filtros.localizacao) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Filtros ativos:</strong>
            {filtros.categoria && ` Categoria: ${filtros.categoria}`}
            {filtros.estado && ` Estado: ${filtros.estado}`}
            {filtros.localizacao && ` Departamento: ${filtros.localizacao}`}
            {` | Mostrando ${equipamentosFiltrados.length} de ${dados.length} equipamentos`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-blue-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">{equipamentosFiltrados.length}</div>
          <div className="text-sm text-gray-600">Equipamentos Filtrados</div>
        </div>
        <div className="card p-6 text-center">
          <Users className="mx-auto h-8 w-8 text-green-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {equipamentosFiltrados.filter(eq => eq.estado === 'Em Uso').length}
          </div>
          <div className="text-sm text-gray-600">Em Uso</div>
        </div>
        <div className="card p-6 text-center">
          <PieChart className="mx-auto h-8 w-8 text-purple-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {Object.keys(equipamentosPorCategoria).length}
          </div>
          <div className="text-sm text-gray-600">Categorias</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Equipamentos por Categoria</h4>
          <div className="space-y-3">
            {Object.entries(equipamentosPorCategoria).map(([categoria, quantidade]) => (
              <div key={categoria} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{categoria}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(quantidade / equipamentosFiltrados.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Equipamentos por Estado</h4>
          <div className="space-y-3">
            {Object.entries(equipamentosPorEstado).map(([estado, quantidade]) => (
              <div key={estado} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{estado}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(quantidade / equipamentosFiltrados.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Equipamentos Detalhada */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Detalhes dos Equipamentos {equipamentosFiltrados.length > 0 && `(${equipamentosFiltrados.length})`}
        </h4>

        {/* PAGINAÇÃO HEADER */}
        {equipamentosFiltrados.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              Mostrando{" "}
              {Math.min((paginaAtual - 1) * itensPorPagina + 1, equipamentosFiltrados.length)}–
              {Math.min(paginaAtual * itensPorPagina, equipamentosFiltrados.length)}{" "}
              de {equipamentosFiltrados.length}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
                disabled={paginaAtual === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium border ${paginaAtual === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                Anterior
              </button>
              <button
                onClick={() => setPaginaAtual((p) => (p < totalPaginas ? p + 1 : p))}
                disabled={paginaAtual === totalPaginas}
                className={`px-3 py-1 rounded-md text-sm font-medium border ${paginaAtual === totalPaginas ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                Próxima
              </button>
            </div>
          </div>
        )}

        {/* TABELA */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº Série</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atribuído a</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipamentosPaginados.map((equip) => (
                <tr key={equip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {equip.modelo || equip.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{equip.numero_serie}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${equip.estado === "Em Uso" ? "bg-green-100 text-green-800" : equip.estado === "Disponível" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {equip.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equip.categoria_nome || "Sem categoria"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equip.localizacao || "Sem departamento"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equip.funcionario_nome || "Não atribuído"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {equipamentosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum equipamento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};