import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Flag, Calendar, FileText, Phone, Home, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PhoneInput } from '../components/ui/PhoneInput';
import { format, parseISO, subYears, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data (mesmo do arquivo original)
const MOCK_INVESTIDORES = [
  {
    id: 1,
    nome_completo: 'João Manuel Silva',
    data_nascimento: '1985-06-15',
    nacionalidade: 'Portuguesa',
    sexo: 'M',
    estado_civil: 'CASADO',
    passaporte_numero: 'P1234567',
    passaporte_validade: '2030-12-31',
    bi_numero: '12345678LA',
    email: 'joao.silva@email.com',
    telefone: '+351912345678',
    endereco: 'Lisboa, Portugal',
    tipo: 'INVESTIMENTO',
    valor_investimento: 150000,
    status: 'PENDENTE',
    observacoes: 'Investidor principal',
    preenchimento_automatico: false
  }
];

const MOCK_DOCUMENTOS = [
  {
    id: 1,
    investidor_id: 1,
    nome_arquivo: 'Passaporte_Joao.pdf',
    tipo: 'PASSPORT',
    data_envio: '2025-01-10'
  }
];

const sexoOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
  { value: 'O', label: 'Outro' }
];

const estadoCivilOptions = [
  { value: 'SOLTEIRO', label: 'Solteiro(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIÚVO', label: 'Viúvo(a)' },
  { value: 'UNIÃO ESTÁVEL', label: 'União Estável' }
];

const tipoInvestimentoOptions = [
  { value: 'INVESTIMENTO', label: 'Investimento' },
  { value: 'DOAÇÃO', label: 'Doação' }
];

const statusOptions = [
  { value: 'PENDENTE', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'EM VERIFICAÇÃO', label: 'Em Verificação', color: 'bg-blue-100 text-blue-800' },
  { value: 'APROVADO', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  { value: 'REJEITADO', label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
  { value: 'SUSPENSO', label: 'Suspenso', color: 'bg-gray-100 text-gray-800' }
];

export const InvestidorFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [investidor, setInvestidor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      status: 'PENDENTE',
      tipo: 'INVESTIMENTO',
      preenchimento_automatico: false
    }
  });

  useEffect(() => {
    if (id && id !== 'novo') {
      setIsEditing(true);
      loadInvestidor(id);
    } else {
      reset({
        nome_completo: '',
        data_nascimento: '',
        nacionalidade: '',
        sexo: '',
        estado_civil: '',
        passaporte_numero: '',
        passaporte_validade: '',
        bi_numero: '',
        anexos: null,
        email: '',
        telefone: '',
        endereco: '',
        tipo: 'INVESTIMENTO',
        valor_investimento: '',
        status: 'PENDENTE',
        observacoes: '',
        preenchimento_automatico: false
      });
    }
  }, [id, reset]);

  const loadInvestidor = async (investidorId) => {
    setLoading(true);
    setTimeout(() => {
      const found = MOCK_INVESTIDORES.find(i => i.id === parseInt(investidorId));
      if (found) {
        setInvestidor(found);
        const formattedData = {
          ...found,
          data_nascimento: found.data_nascimento ? format(parseISO(found.data_nascimento), 'yyyy-MM-dd') : '',
          passaporte_validade: found.passaporte_validade ? format(parseISO(found.passaporte_validade), 'yyyy-MM-dd') : '',
          anexos: found.anexos || null,
        };
        reset(formattedData);
      }
      setLoading(false);
    }, 300);
  };

  const validateAge = (dateString) => {
    if (!dateString) return true;
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = differenceInYears(today, birthDate);
    return age >= 18 || 'Deve ter pelo menos 18 anos';
  };

  const validateInvestment = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Valor inválido';
    return numValue >= 90000 || 'Valor mínimo é 90.000 USD';
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    // Simular API call
    setTimeout(() => {
      console.log('Dados submetidos:', data);
      alert(isEditing ? 'Investidor atualizado com sucesso!' : 'Investidor criado com sucesso!');
      navigate('/investidores');
      setLoading(false);
    }, 1000);
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do investidor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/investidores')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à lista
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Investidor' : 'Novo Investidor'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Atualize as informações do investidor' : 'Preencha os dados do novo investidor'}
            </p>
          </div>
          
          <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
          </Button>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Seções do formulário em cards */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Informações Pessoais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                {...register('nome_completo', { required: 'Nome completo é obrigatório' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nome completo do investidor"
              />
              {errors.nome_completo && (
                <p className="mt-2 text-sm text-red-600">{errors.nome_completo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento *
              </label>
              <input
                {...register('data_nascimento', {
                  required: 'Data de nascimento é obrigatória',
                  validate: validateAge
                })}
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                max={format(subYears(new Date(), 18), 'yyyy-MM-dd')}
              />
              {errors.data_nascimento && (
                <p className="mt-2 text-sm text-red-600">{errors.data_nascimento.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidade *
              </label>
              <input
                {...register('nacionalidade', { required: 'Nacionalidade é obrigatória' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Portuguesa, Brasileira, etc."
              />
              {errors.nacionalidade && (
                <p className="mt-2 text-sm text-red-600">{errors.nacionalidade.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo *
              </label>
              <select
                {...register('sexo', { required: 'Sexo é obrigatório' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecionar sexo</option>
                {sexoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.sexo && (
                <p className="mt-2 text-sm text-red-600">{errors.sexo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Civil *
              </label>
              <select
                {...register('estado_civil', { required: 'Estado civil é obrigatório' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecionar estado civil</option>
                {estadoCivilOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.estado_civil && (
                <p className="mt-2 text-sm text-red-600">{errors.estado_civil.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="exemplo@email.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            Documentos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Passaporte *
              </label>
              <input
                {...register('passaporte_numero', {
                  required: 'Número do passaporte é obrigatório'
                })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: A12345678"
              />
              {errors.passaporte_numero && (
                <p className="mt-2 text-sm text-red-600">{errors.passaporte_numero.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade do Passaporte *
              </label>
              <input
                {...register('passaporte_validade', {
                  required: 'Validade do passaporte é obrigatória'
                })}
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.passaporte_validade && (
                <p className="mt-2 text-sm text-red-600">{errors.passaporte_validade.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do BI (opcional para estrangeiros)
              </label>
              <input
                {...register('bi_numero')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: 12345678LA789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anexos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  {...register('anexos')}
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Clique para adicionar ficheiros
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG (máx. 10MB cada)
                  </p>
                </label>
              </div>
              {watch('anexos') && watch('anexos').length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ficheiros selecionados:</h4>
                  <ul className="space-y-2">
                    {Array.from(watch('anexos')).map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-primary-600" />
            Contacto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <PhoneInput
                {...register('telefone')}
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <textarea
                {...register('endereco')}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Endereço completo"
              />
            </div>
          </div>
        </div>

        {/* Investimento */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
            Informações de Investimento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                {...register('tipo', { required: 'Tipo é obrigatório' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {tipoInvestimentoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="mt-2 text-sm text-red-600">{errors.tipo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Investimento (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  {...register('valor_investimento', {
                    required: 'Valor do investimento é obrigatório',
                    validate: validateInvestment
                  })}
                  type="number"
                  step="0.01"
                  min="90000"
                  className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="90000.00"
                />
              </div>
              {errors.valor_investimento && (
                <p className="mt-2 text-sm text-red-600">{errors.valor_investimento.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Valor mínimo: 90.000 USD
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status é obrigatório' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Observações e Opções */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                {...register('observacoes')}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Observações adicionais sobre o investidor..."
              />
            </div>

            <div className="border-t pt-6">
              <label className="flex items-center">
                <input
                  {...register('preenchimento_automatico')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Preenchimento automático pelo sistema
                </span>
              </label>
              <p className="ml-8 mt-1 text-sm text-gray-500">
                Marque esta opção se os dados foram gerados automaticamente pelo sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/investidores')}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Simular salvamento como rascunho
                alert('Salvo como rascunho!');
              }}
              className="w-full sm:w-auto"
            >
              Salvar como Rascunho
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar Investidor' : 'Criar Investidor')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};