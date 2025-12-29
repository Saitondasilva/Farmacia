import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Phone, User, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { departamentosService } from '../services/departamentosService';
import { useForm } from 'react-hook-form';

export const Departamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartamento, setEditingDepartamento] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [salasInput, setSalasInput] = useState('');

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  const salas = watch('salas') || [];

  useEffect(() => {
    loadDepartamentos();
  }, []);

  const loadDepartamentos = async () => {
    try {
      const response = await departamentosService.getWithStats();
      setDepartamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartamentos = departamentos.filter(departamento =>
    departamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departamento.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departamento.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingDepartamento(null);
    reset({
      nome: '',
      descricao: '',
      responsavel: '',
      telefone_interno: '',
      salas: []
    });
    setSalasInput('');
    setShowModal(true);
  };

  const handleEdit = (departamento) => {
    setEditingDepartamento(departamento);
    reset({
      ...departamento,
      salas: departamento.salas || []
    });
    setSalasInput('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja eliminar este departamento?')) return;

    try {
      await departamentosService.delete(id);
      await loadDepartamentos();
    } catch (error) {
      alert('Erro ao eliminar departamento: ' + error.response?.data?.message);
    }
  };

  const adicionarSala = () => {
    if (salasInput.trim()) {
      const novasSalas = [...salas, salasInput.trim()];
      setValue('salas', novasSalas);
      setSalasInput('');
    }
  };

  const removerSala = (index) => {
    const novasSalas = salas.filter((_, i) => i !== index);
    setValue('salas', novasSalas);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarSala();
    }
  };

  const onSubmit = async (data) => {
    try {
      // CORREÇÃO: Garantir que as salas são incluídas nos dados
      const dadosComSalas = {
        ...data,
        salas: salas // Usa o estado atual das salas
      };

      console.log('Dados a enviar:', dadosComSalas); // Para debug

      if (editingDepartamento) {
        await departamentosService.update(editingDepartamento.id, dadosComSalas);
      } else {
        await departamentosService.create(dadosComSalas);
      }
      setShowModal(false);
      await loadDepartamentos();
    } catch (error) {
      console.error('Erro detalhado:', error);
      alert('Erro ao salvar departamento: ' + (error.response?.data?.message || error.message));
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
          <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-gray-600">Gerir departamentos da empresa</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Departamento
        </Button>
      </div>

      {/* Pesquisa */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar departamentos..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartamentos.map((departamento) => (
          <div key={departamento.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {departamento.nome}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(departamento)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(departamento.id)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {departamento.descricao && (
              <p className="text-gray-600 text-sm mb-4">
                {departamento.descricao}
              </p>
            )}

            {/* Lista de Salas */}
            {departamento.salas && departamento.salas.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Salas:</p>
                <div className="flex flex-wrap gap-1">
                  {departamento.salas.map((sala, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {sala}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              {departamento.responsavel && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>{departamento.responsavel}</span>
                </div>
              )}
              
              {departamento.telefone_interno && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{departamento.telefone_interno}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Funcionários:</span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-medium text-gray-900">
                    {departamento.funcionarios_ativos || 0}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">
                    {departamento.total_funcionarios || 0}
                  </span>
                </div>
              </div>
            </div>

            {!departamento.ativo && (
              <div className="mt-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded inline-block">
                Inativo
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDepartamentos.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Nenhum departamento encontrado' : 'Nenhum departamento criado'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente alterar o termo de pesquisa.' : 'Comece por criar um novo departamento.'}
          </p>
        </div>
      )}

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDepartamento ? 'Editar Departamento' : 'Novo Departamento'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome *</label>
            <input
              {...register('nome', { 
                required: 'Nome é obrigatório',
                minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
              })}
              type="text"
              className="input mt-1"
              placeholder="Ex: TI, Vendas, Marketing..."
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
              placeholder="Descrição do departamento..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Responsável</label>
              <input
                {...register('responsavel')}
                type="text"
                className="input mt-1"
                placeholder="Nome do responsável..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone Interno</label>
              <input
                {...register('telefone_interno')}
                type="text"
                className="input mt-1"
                placeholder="Ex: 1000"
              />
            </div>
          </div>

          {/* Campo para Adicionar Salas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salas do Departamento
            </label>
            
            {/* Input para adicionar nova sala */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={salasInput}
                onChange={(e) => setSalasInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input flex-1"
                placeholder="Digite o nome da sala e pressione Enter"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={adicionarSala}
                disabled={!salasInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Lista de salas adicionadas */}
            {salas.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Salas adicionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {salas.map((sala, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                    >
                      <span>{sala}</span>
                      <button
                        type="button"
                        onClick={() => removerSala(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Campo hidden para o react-hook-form */}
          <input
            type="hidden"
            {...register('salas')}
          />

          {editingDepartamento && (
            <div>
              <label className="flex items-center">
                <input
                  {...register('ativo')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  defaultChecked={editingDepartamento.ativo}
                />
                <span className="ml-2 text-sm text-gray-700">Departamento ativo</span>
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingDepartamento ? 'Atualizar' : 'Criar'} Departamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};