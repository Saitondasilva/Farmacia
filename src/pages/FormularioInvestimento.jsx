import React from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO, subYears, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PhoneInput } from '../components/ui/PhoneInput';
import { useNavigate, useLocation } from 'react-router-dom';

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

export default function FormularioInvestimento() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editingId = params.get('id');

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      status: 'PENDENTE',
      preenchimento_automatico: false
    }
  });

  React.useEffect(() => {
    if (editingId) {
      const stored = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      const inv = stored.find(i => String(i.id) === String(editingId));
      if (inv) {
        reset({
          ...inv,
          data_nascimento: inv.data_nascimento ? format(parseISO(inv.data_nascimento), 'yyyy-MM-dd') : '',
          passaporte_validade: inv.passaporte_validade ? format(parseISO(inv.passaporte_validade), 'yyyy-MM-dd') : ''
        });
      }
    }
  }, [editingId, reset]);

  const onSubmit = (data) => {
    const stored = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    if (editingId) {
      const updated = stored.map(i => (String(i.id) === String(editingId) ? { ...i, ...data } : i));
      localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(updated));
    } else {
      const novo = { ...data, id: Date.now(), valor_investimento: parseFloat(data.valor_investimento || 0) };
      stored.push(novo);
      localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(stored));
    }

    navigate('/investidores');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulário de Investidor</h1>
          <p className="text-gray-600">Preencha os dados do investidor</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-secondary" onClick={() => navigate(-1)}>Voltar</button>
        </div>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
              <input {...register('nome_completo', { required: 'Nome completo é obrigatório' })} type="text" className="input mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Nascimento *</label>
              <input {...register('data_nascimento', { required: 'Data de nascimento é obrigatória', validate: validateAge })} type="date" className="input mt-1" max={format(subYears(new Date(), 18), 'yyyy-MM-dd')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nacionalidade *</label>
              <input {...register('nacionalidade', { required: 'Nacionalidade é obrigatória' })} type="text" className="input mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo *</label>
              <select {...register('sexo', { required: 'Sexo é obrigatório' })} className="input mt-1">
                <option value="">Selecionar sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>
          </div>

          {/* Documentos simplificados */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Documentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número do Passaporte *</label>
                <input {...register('passaporte_numero', { required: 'Número do passaporte é obrigatório' })} type="text" className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Validade do Passaporte *</label>
                <input {...register('passaporte_validade', { required: 'Validade do passaporte é obrigatória' })} type="date" className="input mt-1" min={format(new Date(), 'yyyy-MM-dd')} />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Número do BI (opcional)</label>
              <input {...register('bi_numero')} type="text" className="input mt-1" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Anexos (vários)</label>
              <input {...register('anexos')} type="file" className="mt-1" multiple />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <PhoneInput {...register('telefone')} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <textarea {...register('endereco')} rows="3" className="input mt-1" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" className="btn-secondary" onClick={() => navigate('/investidores')}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingId ? 'Atualizar' : 'Criar'} Investidor</button>
          </div>
        </form>
      </div>
    </div>
  );
}
