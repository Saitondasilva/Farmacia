import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, CheckCircle, RefreshCw, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { format, parseISO, subYears, differenceInYears } from 'date-fns';
//import { ptBR } from 'date-fns/locale';
import { PhoneInput } from '../components/ui/PhoneInput';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateInvestmentCode } from '../utils/generateInvestmentCode';

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

const MOCK_DOCUMENTOS = [
    {
        id: 1,
        investidor_id: 2,
        nome_arquivo: 'Passaporte_Maria.pdf',
        tipo: 'PASSPORT',
        data_envio: '2025-01-10'
    },
    {
        id: 2,
        investidor_id: 2,
        nome_arquivo: 'Extrato_Bancario.pdf',
        tipo: 'EXTRATO_BANCARIO',
        data_envio: '2025-01-12'
    }
];

// Funções auxiliares para salvar/atualizar investidores
const saveInvestidor = (dados) => {
    const stored = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    stored.push(dados);
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(stored));
    return dados;
};

const updateInvestidor = (id, dados) => {
    const stored = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    const updated = stored.map(i => (String(i.id) === String(id) ? { ...i, ...dados } : i));
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(updated));
    return dados;
};

const processFiles = async (files) => {
    if (!files) return [];
    // Implementar lógica de upload se necessário
    return Array.from(files).map(file => ({
        nome: file.name,
        tamanho: file.size,
        tipo: file.type,
        data_upload: new Date().toISOString()
    }));
};

export default function FormularioInvestimento() {
    const [editingInvestidor, setEditingInvestidor] = useState(null);
    const [codigoGerado, setCodigoGerado] = useState('');
    const [showCodeAlert, setShowCodeAlert] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const editingId = params.get('id');

    const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
        defaultValues: {
            status: 'PENDENTE',
            preenchimento_automatico: false
        }
    });

    const statusOptions = [
        { value: 'PENDENTE', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'EM VERIFICAÇÃO', label: 'Em Verificação', color: 'bg-blue-100 text-blue-800' },
        { value: 'APROVADO', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
        { value: 'REJEITADO', label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
        { value: 'SUSPENSO', label: 'Suspenso', color: 'bg-gray-100 text-gray-800' }
    ];

    const tipoInvestimentoOptions = [
        { value: 'INVESTIMENTO', label: 'Investimento' },
        { value: 'DOAÇÃO', label: 'Doação' }
    ];

    // Effect para carregar dados quando editando
    React.useEffect(() => {
        if (editingId) {
            const stored = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
            const inv = stored.find(i => String(i.id) === String(editingId));
            if (inv) {
                setEditingInvestidor(inv);
                reset({
                    ...inv,
                    data_nascimento: inv.data_nascimento ? format(parseISO(inv.data_nascimento), 'yyyy-MM-dd') : '',
                    passaporte_validade: inv.passaporte_validade ? format(parseISO(inv.passaporte_validade), 'yyyy-MM-dd') : ''
                });
            }
        }
    }, [editingId, reset]);

    // Effect para gerar código quando é novo registro
    useEffect(() => {
        if (!editingId) {
            const novoCodigo = generateInvestmentCode();
            setCodigoGerado(novoCodigo);
        }
    }, [editingId]);

    // Função para regenerar código
    const regenerarCodigo = () => {
        if (!editingId && window.confirm('Gerar novo código? O código anterior será perdido.')) {
            setCodigoGerado(generateInvestmentCode());
        }
    };

    const onSubmit = async (data) => {
        try {
            // Processar arquivos primeiro
            let anexosProcessados = [];
            if (data.anexos && data.anexos.length > 0) {
                anexosProcessados = await processFiles(data.anexos);
            }

            // Preparar dados completos
            const dadosCompletos = {
                ...data,
                id: editingId ? parseInt(editingId) : Date.now(),
                codigo_identificacao: editingId ? data.codigo_identificacao : codigoGerado,
                data_submissao: editingId ? data.data_submissao : new Date().toISOString(),
                data_atualizacao: new Date().toISOString(),
                valor_investimento: parseFloat(data.valor_investimento || 0),
                anexos: anexosProcessados,
            };

            // Salvar dados
            if (editingId) {
                await updateInvestidor(editingId, dadosCompletos);
            } else {
                await saveInvestidor(dadosCompletos);
                setShowCodeAlert(true);
            }

            // Navegar com mensagem de sucesso
            navigate('/ver-investidores', {
                state: {
                    message: editingId ? 'Investidor atualizado com sucesso!' : 'Investidor criado com sucesso!',
                    codigo: dadosCompletos.codigo_identificacao
                }
            });

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar os dados. Tente novamente.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Alert de sucesso com código */}
            {showCodeAlert && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">
                                Investidor criado com sucesso!
                                <br />
                                <strong>Código de identificação: {codigoGerado}</strong>
                                <br />
                                <span className="text-xs">Guarde este código para referência futura</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Formulário de Investimento</h1>
                    <p className="text-gray-600">Preencha os dados do investidor</p>
                </div>
                <div className="flex items-center space-x-2">
                    {!editingId && codigoGerado && (
                        <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Código:</span>
                            <span className="font-mono font-bold text-blue-700">{codigoGerado}</span>
                            <button
                                type="button"
                                onClick={regenerarCodigo}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Gerar novo código"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>Voltar</Button>
                </div>
            </div>

            <div className="card p-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Campo hidden para o código (quando editando) */}
                    {!editingId && (
                        <input
                            type="hidden"
                            {...register('codigo_identificacao')}
                            value={codigoGerado}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                            <input {...register('nome_completo',
                                { required: 'Nome completo é obrigatório' })}
                                type="text" className="input mt-1"
                                placeholder="Nome completo do investidor" />
                            {errors.nome_completo && (
                                <p className="mt-1 text-sm text-red-600">{errors.nome_completo.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Nascimento *</label>
                            <input {...register('data_nascimento',
                                { required: 'Data de nascimento é obrigatória', validate: validateAge })}
                                type="date" className="input mt-1" max={format(subYears(new Date(), 18), 'yyyy-MM-dd')}
                            />
                            {errors.data_nascimento && (
                                <p className="mt-1 text-sm text-red-600">{errors.data_nascimento.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nacionalidade *</label>
                            <input {...register('nacionalidade',
                                { required: 'Nacionalidade é obrigatória' })}
                                type="text" className="input mt-1"
                                placeholder="Ex: Portuguesa, Brasileira, etc."
                            />
                            {errors.nacionalidade && (
                                <p className="mt-1 text-sm text-red-600">{errors.nacionalidade.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sexo *</label>
                            <select {...register('sexo', { required: 'Sexo é obrigatório' })} className="input mt-1">
                                <option value="">Selecionar sexo</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                                <option value="O">Outro</option>
                            </select>
                            {errors.sexo && (
                                <p className="mt-1 text-sm text-red-600">{errors.sexo.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado Civil *</label>
                            <select {...register('estado_civil', { required: 'Estado civil é obrigatório' })} className="input mt-1">
                                <option value="">Selecionar estado civil</option>
                                <option value="SOLTEIRO">Solteiro(a)</option>
                                <option value="CASADO">Casado(a)</option>
                                <option value="DIVORCIADO">Divorciado(a)</option>
                                <option value="VIÚVO">Viúvo(a)</option>
                                <option value="UNIÃO ESTÁVEL">União Estável</option>
                            </select>
                            {errors.estado_civil && (
                                <p className="mt-1 text-sm text-red-600">{errors.estado_civil.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
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
                                className="input mt-1"
                                placeholder="exemplo@email.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
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
                            <label className="block text-sm font-medium text-gray-700">Número do BI (opcional para estrangeiros)</label>
                            <input {...register('bi_numero')} type="text" className="input mt-1" />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Anexos</label>
                            <input {...register('anexos')} type="file" className="mt-1" multiple />
                            {watch('anexos') && watch('anexos').length > 0 ? (
                                <ul className="mt-2 text-sm text-gray-700 space-y-1">
                                    {Array.from(watch('anexos')).map((f, idx) => (
                                        <li key={idx} className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <span>{f.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (editingInvestidor && MOCK_DOCUMENTOS.filter(d => d.investidor_id === editingInvestidor.id).length > 0) ? (
                                <ul className="mt-2 text-sm text-gray-700 space-y-1">
                                    {MOCK_DOCUMENTOS.filter(d => d.investidor_id === editingInvestidor.id).map(d => (
                                        <li key={d.id} className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <span>{d.nome_arquivo}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
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

                    {/*   {/* Investimento 
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Informações de Investimento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tipo *
                                </label>
                                <select
                                    {...register('tipo', { required: 'Tipo é obrigatório' })}
                                    className="input mt-1"
                                >
                                    <option value="">Selecionar tipo</option>
                                    {tipoInvestimentoOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.tipo && (
                                    <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Valor do Investimento (USD) *
                                </label>
                                <input
                                    {...register('valor_investimento', {
                                        required: 'Valor do investimento é obrigatório',
                                        validate: validateInvestment
                                    })}
                                    type="number"
                                    step="0.01"
                                    min="90000"
                                    className="input mt-1"
                                    placeholder="90000.00"
                                />
                                {errors.valor_investimento && (
                                    <p className="mt-1 text-sm text-red-600">{errors.valor_investimento.message}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Valor mínimo: 90.000 USD
                                </p>
                            </div>
                        </div>
*/}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Status *
                        </label>
                        <input
                            type="hidden"
                            value="Pendente"
                        />
                        <p className="mt-1 text-gray-900">Pendente</p>
                    </div>


                    {/* Observações */}
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Observações
                        </label>
                        <textarea
                            {...register('observacoes')}
                            rows="3"
                            className="input mt-1"
                            placeholder="Observações adicionais sobre o investidor..."
                        />
                    </div>

                    {/* Preenchimento Automático */}
                    <div className="border-t pt-4">
                        <label className="flex items-center">
                            <input
                                {...register('preenchimento_automatico')}
                                type="checkbox"
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Preenchimento automático pelo sistema
                            </span>
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                            Marque esta opção se os dados foram gerados automaticamente pelo sistema.
                        </p>
                    </div>

                    <div className="flex justify-end items-center space-x-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={() => navigate('/investidores')}>Cancelar</Button>
                        <Button type="submit" variant="primary">{editingId ? 'Atualizar' : 'Criar Investidor'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}