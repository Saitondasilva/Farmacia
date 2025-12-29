import { useState, useEffect } from 'react';
import { Filter, BarChart3, Building, Truck } from 'lucide-react';
import { categoriasService } from '../../services/categoriasService';
import { departamentosService } from '../../services/departamentosService';
import { fornecedoresService } from '../../services/fornecedoresService';

export const RelatorioFilters = ({ onFilterChange, className = '' }) => {
  const [filtros, setFiltros] = useState({
    tipo: 'equipamentos',
    periodo: '30',
    categoria: '',
    departamento: '',
    fornecedor: '',
    estado: ''
  });

  const [categorias, setCategorias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);

  const tiposRelatorio = [
    { value: 'equipamentos', label: 'Equipamentos', icon: BarChart3 },
    { value: 'departamentos', label: 'Departamentos', icon: Building },
    { value: 'fornecedores', label: 'Fornecedores', icon: Truck }
  ];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cats, deps, fors] = await Promise.all([
          categoriasService.getAll(),
          departamentosService.getAll(),
          fornecedoresService.getAll()
        ]);
        setCategorias(cats.data);
        setDepartamentos(deps.data);
        setFornecedores(fors.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleFilterChange = (key, value) => {
    const novosFiltros = { ...filtros, [key]: value };
    
    // Limpar filtros específicos quando mudar o tipo de relatório
    if (key === 'tipo') {
      novosFiltros.categoria = '';
      novosFiltros.departamento = '';
      novosFiltros.fornecedor = '';
      novosFiltros.estado = '';
    }
    
    setFiltros(novosFiltros);
    onFilterChange(novosFiltros);
  };

  return (
    <div className={`card p-4 ${className}`}>
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Filtros do Relatório</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo de relatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Relatório
          </label>
          <select
            value={filtros.tipo}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
            className="input"
          >
            {tiposRelatorio.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Período 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período
          </label>
          <select
            value={filtros.periodo}
            onChange={(e) => handleFilterChange('periodo', e.target.value)}
            className="input"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 3 meses</option>
            <option value="365">Último ano</option>
            <option value="0">Todo o período</option>
          </select>
        </div>*/}

        {/* EQUIPAMENTOS - Mostrar mais filtros */}
        {filtros.tipo === 'equipamentos' && (
          <>
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="input"
              >
                <option value="">Todas as categorias</option>
                {loading ? (
                  <option disabled>Carregando...</option>
                ) : (
                  categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="input"
              >
                <option value="">Todos os estados</option>
                <option value="Disponível">Disponível</option>
                <option value="Em Uso">Em Uso</option>
                <option value="Em Manutenção">Em Manutenção</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>

            {/* Departamento para equipamentos também 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                value={filtros.departamento}
                onChange={(e) => handleFilterChange('departamento', e.target.value)}
                className="input"
              >
                <option value="">Todos os departamentos</option>
                {loading ? (
                  <option disabled>Carregando...</option>
                ) : (
                  departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))
                )}
              </select>
            </div>*/}
          </>
        )}

        {/* DEPARTAMENTOS */}
        {filtros.tipo === 'departamentos' && (
          <div>
           {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              value={filtros.departamento}
              onChange={(e) => handleFilterChange('departamento', e.target.value)}
              className="input"
            >
              <option value="">Todos os departamentos</option>
              {loading ? (
                <option disabled>Carregando...</option>
              ) : (
                departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))
              )}
            </select>*/}
          </div>
        )}

        {/* FORNECEDORES */}
        {filtros.tipo === 'fornecedores' && (
          <div>
            {/*<label className="block text-sm font-medium text-gray-700 mb-1">
              Fornecedor
            </label>
            <select
              value={filtros.fornecedor}
              onChange={(e) => handleFilterChange('fornecedor', e.target.value)}
              className="input"
            >
              <option value="">Todos os fornecedores</option>
              {loading ? (
                <option disabled>Carregando...</option>
              ) : (
                fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))
              )}
            </select>*/}
          </div>
        )}
      </div>
    </div>
  );
};