import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Monitor } from 'lucide-react';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  const currentYear = new Date().getFullYear();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    const result = await login(data);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <Monitor className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Gestão de Estoque de Equipamentos Informáticos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login na sua conta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nome do utilizador
            </label>
            <input
              {...register('username', { required: 'Nome do utilizador é obrigatório' })}
              type="text"
              className="input mt-1"
              placeholder="Seu nome de utilizador"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Palavra passe
            </label>
            <input
              {...register('password', { required: 'Palavra passe é obrigatória' })}
              type="password"
              className="input mt-1"
              placeholder="Sua palavra passe"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-60"
            >
              Entrar
            </Button>
          </div>
          
          <div className="mt-6 text-[11px] text-gray-500 text-center">
            © {currentYear} GEEI-DGRN — Todos os direitos reservados.
          </div>
        </form>
      </div>
    </div>
  );
};