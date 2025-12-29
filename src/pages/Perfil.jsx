import { useState, useEffect } from 'react';
import { User, Shield, Calendar, Settings } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Utilizadores } from './Utilizadores';
import { utilizadoresService } from '../services/utilizadoresService';

export const Perfil = () => {
  const { user, changePassword } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUtilizadores, setShowUtilizadores] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handlePasswordChange = async (data) => {
    const result = await changePassword(data);

    if (result.success) {
      setPasswordMessage('Password alterada com sucesso!');
      reset();
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage('');
      }, 2000);
    } else {
      setPasswordMessage(result.message);
    }
  };

  const getRoleDisplay = (role) => {
    const roles = {
      'admin': 'Administrador',
      'gestor': 'Gestor',
      'tecnico': 'Técnico',
      'consulta': 'Consulta'
    };
    return roles[role] || role;
  };

  // Verifica se o usuário é administrador
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user.id) {
      loadUserData();
    } else {
      setError('ID do utilizador não disponível');
      setLoading(false);
    }
  }, [user.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Verifica se userId é válido
      if (!user.id) {
        throw new Error('ID do utilizador não disponível');
      }

      // Converte para número com validação
      const userIdNum = parseInt(user.id, 10);
      
      if (isNaN(userIdNum)) {
        throw new Error(`ID do utilizador inválido: ${user.id}`);
      }

      const res = await utilizadoresService.getById(userIdNum);
      // console.log('Resposta da API:', res); // Debug
      // Ajuste conforme a estrutura real da sua resposta API
      if (res && (res.data || res)) {
        setUserData(res.data || res);
      } else {
        throw new Error('Resposta da API inválida');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do utilizador:', error);
      setError(`Erro ao carregar perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para formatar datas com segurança
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '-' : format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '-' : format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Erro ao formatar data/hora:', error);
      return '-';
    }
  };

  // Se mostrarUtilizadores for true, mostra o componente Utilizadores
  if (showUtilizadores) {
    return <Utilizadores onBack={() => setShowUtilizadores(false)} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">A carregar perfil...</div>
      </div>
    );
  }

  // Dados a serem exibidos (prioridade: userData > user)
  const displayData = userData || user;

  return (
    <div className="space-y-6">
      {/* Cabeçalho - Meu Perfil e Gerir Utilizadores na mesma linha */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerir a sua conta e preferências</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowUtilizadores(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Gerir Utilizadores
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-800">
              <p>{error}</p>
              <p className="text-sm mt-1">Mostrando informações básicas do perfil.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Perfil */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <p className="mt-1 text-sm text-gray-900">{displayData?.nome || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{displayData?.username || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{displayData?.email || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cargo</label>
                <p className="mt-1 text-sm text-gray-900">{getRoleDisplay(displayData?.role)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(displayData?.data_criacao)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Último Login</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(displayData?.ultimo_login)}
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas do Usuário */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">-</div>
                <div className="text-sm text-gray-600">Equipamentos Atribuídos</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">-</div>
                <div className="text-sm text-gray-600">Atribuições Realizadas</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">-</div>
                <div className="text-sm text-gray-600">Equipamentos Geridos</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">-</div>
                <div className="text-sm text-gray-600">Relatórios Gerados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar de Ações */}
        <div className="space-y-6">
          {/* Card de Segurança - Apenas para admin */}
          {isAdmin && (
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Segurança</h3>
              </div>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="w-full"
              >
                Alterar Password
              </Button>
            </div>
          )}

          {/* Card de Informações da Conta */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Conta</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-green-600 font-medium">Ativa</span>
              </div>
              <div className="flex justify-between">
                <span>Permissões:</span>
                <span>{getRoleDisplay(displayData?.role)}</span>
              </div>
              <div className="flex justify-between">
                <span>Membro desde:</span>
                <span>{formatDate(displayData?.data_criacao)}</span>
              </div>
            </div>
          </div>

          {/* Card de Sistema */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Sistema</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Versão:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Última Atividade:</span>
                <span>Agora</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Alteração de Password - Apenas para admin */}
      {isAdmin && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordMessage('');
            reset();
          }}
          title="Alterar Password"
        >
          <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
            {passwordMessage && (
              <div className={`p-3 rounded ${passwordMessage.includes('sucesso')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                {passwordMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Password Atual *</label>
              <input
                {...register('currentPassword', { required: 'Password atual é obrigatória' })}
                type="password"
                className="input mt-1"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nova Password *</label>
              <input
                {...register('newPassword', {
                  required: 'Nova password é obrigatória',
                  minLength: { value: 6, message: 'Password deve ter pelo menos 6 caracteres' }
                })}
                type="password"
                className="input mt-1"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordMessage('');
                  reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Alterar Password
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};