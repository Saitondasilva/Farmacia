import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, ArrowLeft, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { utilizadoresService } from '../services/utilizadoresService';
import { useForm } from 'react-hook-form';

export const Utilizadores = (props) => {
    const { onBack } = props;
    const { user, changePassword } = useAuth();
    const [utilizadores, setUtilizadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editingUtilizador, setEditingUtilizador] = useState(null);
    const [selectedUtilizador, setSelectedUtilizador] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: errorsPassword } } = useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await utilizadoresService.getAll();
            setUtilizadores(res.data || res);
        } catch (error) {
            console.error('Erro ao carregar utilizadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUtilizadores = utilizadores.filter(u =>
        u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setEditingUtilizador(null);
        reset({ password: '' });
        setShowModal(true);
    };

    const handleEdit = (utilizador) => {
        setEditingUtilizador(utilizador);
        reset(utilizador);
        setShowModal(true);
    };

    const handleChangePassword = (utilizador) => {
        setSelectedUtilizador(utilizador);
        resetPassword();
        setPasswordMessage('');
        setShowPasswordModal(true);
    };

    const handleDelete = async (id) => {
        // Impede que o admin se delete a si próprio
        if (id === user.id) {
            toast.warning('Não pode eliminar a sua própria conta!');
            return;
        }

        if (!confirm('Tem certeza que deseja eliminar este utilizador?')) return;
        try {
            await utilizadoresService.delete(id);
            await loadData();
            toast.success('Utilizador eliminado com sucesso!');
        } catch (error) {
            toast.error('Erro ao eliminar utilizador: ' + error.response?.data?.message);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingUtilizador) {
                await utilizadoresService.update(editingUtilizador.id, data);
            } else {
                await utilizadoresService.create(data);
            }
            setShowModal(false);
            await loadData();
            toast.success('Utilizador criado com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar utilizador: ' + error.response?.data?.message);
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
                        <h1 className="text-2xl font-bold text-gray-900">Utilizadores</h1>
                        <p className="text-gray-600">Gerir contas de acesso do sistema</p>
                    </div>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Utilizador
                </Button>
            </div>

            {/* Filtro de pesquisa */}
            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, username, email ou cargo..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabela de utilizadores */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Função</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredUtilizadores.map((u) => (
                            <tr key={u.id}>
                                <td className="font-medium">{u.nome}</td>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(u)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Editar utilizador"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Eliminar utilizador"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUtilizadores.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum utilizador encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Tente alterar o termo de pesquisa.' : 'Comece por adicionar um novo utilizador.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Criar/Editar */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUtilizador ? 'Editar Utilizador' : 'Novo Utilizador'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome *</label>
                        <input
                            {...register('nome', { required: 'Nome é obrigatório' })}
                            type="text"
                            className="input mt-1"
                        />
                        {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username *</label>
                        <input
                            {...register('username', { required: 'Username é obrigatório' })}
                            type="text"
                            className="input mt-1"
                        />
                        {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                            {...register('email', { required: 'Email é obrigatório' })}
                            type="email"
                            className="input mt-1"
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    {!editingUtilizador && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password *</label>
                            <input
                                {...register('password', { required: 'Password é obrigatória' })}
                                type="password"
                                className="input mt-1"
                            />
                            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Função *</label>
                        <select
                            {...register('role', { required: 'Função é obrigatória' })}
                            className="input mt-1"
                        >
                            <option value="">Selecionar função</option>
                            <option value="admin">Administrador</option>
                            <option value="gestor">Gestor</option>
                            <option value="tecnico">Técnico</option>
                            <option value="consulta">Consulta</option>
                        </select>
                        {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editingUtilizador ? 'Atualizar' : 'Criar'} Utilizador
                        </Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};