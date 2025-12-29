import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tags } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { categoriasService } from '../services/categoriasService';
import { useForm } from 'react-hook-form';

export const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await categoriasService.getAll();
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingCategoria(null);
    reset();
    setShowModal(true);
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    reset(categoria);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja eliminar esta categoria?')) return;

    try {
      await categoriasService.delete(id);
      await loadCategorias();
    } catch (error) {
      alert('Erro ao eliminar categoria: ' + error.response?.data?.message);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategoria) {
        await categoriasService.update(editingCategoria.id, data);
      } else {
        await categoriasService.create(data);
      }
      setShowModal(false);
      await loadCategorias();
    } catch (error) {
      alert('Erro ao salvar categoria: ' + error.response?.data?.message);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600">Gerir categorias de equipamentos</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Pesquisa */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar categorias..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategorias.map((categoria) => (
          <div key={categoria.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {categoria.nome}
                </h3>
                {categoria.descricao && (
                  <p className="text-gray-600 text-sm mb-4">
                    {categoria.descricao}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Tags className="w-4 h-4 mr-1" />
                  <span>Categoria de equipamentos</span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(categoria)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(categoria.id)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategorias.length === 0 && (
        <div className="text-center py-12">
          <Tags className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria criada'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente alterar o termo de pesquisa.' : 'Comece por criar uma nova categoria.'}
          </p>
        </div>
      )}

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome *</label>
            <input
              {...register('nome', { required: 'Nome é obrigatório' })}
              type="text"
              className="input mt-1"
              placeholder="Ex: Laptops, Monitores, Impressoras..."
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              {...register('descricao')}
              rows={3}
              className="input mt-1"
              placeholder="Descrição da categoria..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingCategoria ? 'Atualizar' : 'Criar'} Categoria
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};