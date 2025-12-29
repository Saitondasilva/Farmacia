import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Users, Building } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';


export const RelatorioDepartamentos = ({ dados, filtros }) => {
  if (!dados) return <LoadingSpinner />;

  // FILTRAR DEPARTAMENTOS COM BASE NOS FILTROS
  const departamentosFiltrados = useMemo(() => {
    return dados.filter(dept => {
      let passaFiltro = true;

      if (filtros.departamento && dept.id) {
        passaFiltro =
          passaFiltro &&
          dept.id.toString() === filtros.departamento.toString();
      }

      return passaFiltro;
    });
  }, [dados, filtros.departamento]);

  const departamentosCount = useMemo(() => {
    return departamentosFiltrados.reduce((acc, de) => {
      acc[de.departamento] = (acc[de.departamento] || 0) + 1;
      return acc;
    }, {});
  }, [departamentosFiltrados]);

  return (
    <div className="space-y-6">
      {/* Indicador de filtros ativos */}
      {filtros.departamento && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Filtro ativo:</strong> Departamento selecionado
            {` | Mostrando ${departamentosFiltrados.length} de ${dados.length} departamentos`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <Building className="mx-auto h-8 w-8 text-blue-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">{Object.keys(departamentosCount).length}</div>
          <div className="text-sm text-gray-600">Departamentos Filtrados</div>
        </div>
        <div className="card p-6 text-center">
          <Users className="mx-auto h-8 w-8 text-green-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {departamentosFiltrados.reduce((sum, dept) => sum + (dept.total_funcionarios || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total de Funcionários</div>
        </div>
        <div className="card p-6 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-purple-500" />
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {departamentosFiltrados.reduce((sum, dept) => sum + (dept.equipamentos_atribuidos || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Equipamentos Atribuídos</div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Departamentos e Estatísticas {departamentosFiltrados.length > 0 && `(${departamentosFiltrados.length})`}
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipamentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categorias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sala
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departamentosFiltrados.map((dept) => (
                <tr key={dept.id || dept.departamento}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.nome || dept.departamento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.total_funcionarios || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.equipamentos_atribuidos || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {dept.categorias_utilizadas ?
                      dept.categorias_utilizadas.split(',').slice(0, 3).join(', ') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.sala || 'Não definida'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {departamentosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum departamento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};