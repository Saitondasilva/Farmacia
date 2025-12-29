import { useState, useEffect } from 'react';
import { BarChart3, Truck } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const RelatorioFornecedores = ({ dados, filtros }) => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5; // ajuste aqui o número de linhas por página

  if (!dados) return <LoadingSpinner />;

  // FILTRAR FORNECEDORES COM BASE NOS FILTROS
  const fornecedoresFiltrados = dados.filter(forn => {
    let passaFiltro = true;

    if (filtros.fornecedor && forn.id) {
      passaFiltro = passaFiltro && forn.id.toString() === filtros.fornecedor.toString();
    }

    return passaFiltro;
  });

  // PAGINAÇÃO
  const totalPaginas = Math.ceil(fornecedoresFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const fornecedoresPaginados = fornecedoresFiltrados.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  );

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  useEffect(() => {
    // Sempre que mudar o filtro, voltar para a página 1
    setPaginaAtual(1);
  }, [filtros]);

  return (
    <div className="space-y-6">
      {/* Indicador de filtros ativos */}
      {filtros.fornecedor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Filtro ativo:</strong> Fornecedor selecionado
            {` | Mostrando ${fornecedoresFiltrados.length} de ${dados.length} fornecedores`}
          </p>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <Truck className="mx-auto h-8 w-8 text-blue-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">{fornecedoresFiltrados.length}</div>
          <div className="text-sm text-gray-600">Fornecedores Filtrados</div>
        </div>
        <div className="card p-6 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-green-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {fornecedoresFiltrados.length}
          </div>
          <div className="text-sm text-gray-600">Equipamentos Fornecidos</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Fornecedores e Estatísticas{' '}
          {fornecedoresFiltrados.length > 0 && `(${fornecedoresFiltrados.length})`}
        </h4>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipamentos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fornecedoresPaginados.map((forn) => (
                <tr key={forn.fornecedor_id || forn.fornecedor_nome}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {forn.fornecedor_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {forn.fornecedor_contacto || 'Não definido'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {forn.fornecedor_email || 'Não definido'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {forn.equipamento_marca || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {fornecedoresFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum fornecedor encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>

        {/* Paginação */}
        {fornecedoresFiltrados.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="text-sm text-gray-600">
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button
              onClick={() => mudarPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
