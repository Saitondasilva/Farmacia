import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SalaSelect } from '../ui/SalaSelect';
import { useForm } from 'react-hook-form';
import { historicoMovimentacoesService } from '../../services/historicoMovimentacoesService';
import { funcionariosService } from '../../services/funcionariosService';
import { departamentosService } from '../../services/departamentosService';

export const TransferenciaSalaModal = ({
    isOpen,
    onClose,
    atribuicao,
    onTransferenciaSucesso,
    funcionarios: funcionariosProp,
    departamentos: departamentosIniciais
}) => {
    const [loading, setLoading] = useState(false);
    const [departamentos, setDepartamentos] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();

    const departamentoDestinoId = watch('departamento_destino_id');
    const salaDestino = watch('sala_destino');

    useEffect(() => {
        if (isOpen) {
            loadDepartamentos();
            loadFuncionarios();
            resetForm();
        }
    }, [isOpen, atribuicao]);

    const resetForm = () => {
        if (!atribuicao) return;

        console.log('🔄 Resetando formulário com atribuição:', atribuicao);

        // Buscar funcionário atualizado
        const funcionarioAtual = encontrarFuncionario(atribuicao.funcionario_id);

        const defaultValues = {
            funcionario_id: atribuicao.funcionario_id || '',
            equipamento_id: atribuicao.equipamento_id || '',
            departamento_origem_id: funcionarioAtual?.departamento_id || atribuicao.departamento_id || '',
            sala_origem: funcionarioAtual?.sala || atribuicao.funcionario_sala || 'Sala não definida',
            departamento_destino_id: funcionarioAtual?.departamento_id || '', // Preencher com atual
            sala_destino: funcionarioAtual?.sala || '', // Preencher com atual
            observacoes: ''
        };

        console.log('📝 Valores padrão do formulário:', defaultValues);
        reset(defaultValues);
    };

    const loadDepartamentos = async () => {
        try {
            if (departamentosIniciais && departamentosIniciais.length > 0) {
                setDepartamentos(departamentosIniciais);
            } else {
                const response = await departamentosService.getAll();
                setDepartamentos(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar departamentos:', error);
        }
    };

    const loadFuncionarios = async () => {
        try {
            if (funcionariosProp && funcionariosProp.length > 0) {
                setFuncionarios(funcionariosProp);
            } else {
                const response = await funcionariosService.getAll();
                setFuncionarios(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
            setFuncionarios(funcionariosProp || []);
        }
    };

    const encontrarFuncionario = (funcionarioId) => {
        console.log('🔍 Buscando funcionário com ID:', funcionarioId);
        console.log('📋 Lista de funcionários disponíveis:', funcionarios);

        if (!funcionarioId) {
            console.warn('❌ ID do funcionário não fornecido');
            return null;
        }

        // Normalizar o ID para string para comparação
        const idBuscado = funcionarioId.toString().trim();

        const funcionarioEncontrado = funcionarios.find(f => {
            const idFuncionario = f.id?.toString().trim();
            console.log(`Comparando: ${idBuscado} === ${idFuncionario}`);
            return idFuncionario === idBuscado;
        });

        console.log('✅ Funcionário encontrado:', funcionarioEncontrado);
        return funcionarioEncontrado || null;
    };

    const validarTransferencia = (data) => {
        const errors = [];

        if (!data.departamento_destino_id) {
            errors.push('Selecione um departamento destino');
        }

        if (!data.sala_destino) {
            errors.push('Selecione uma sala destino');
        }

        if (data.departamento_origem_id === data.departamento_destino_id &&
            data.sala_origem === data.sala_destino) {
            errors.push('O destino deve ser diferente da origem');
        }

        return errors;
    };

    const onSubmit = async (data) => {
        setLoading(true);
        console.log('📝 Dados do formulário de transferência:', data);

        try {
            const errosValidacao = validarTransferencia(data);
            if (errosValidacao.length > 0) {
                throw new Error(errosValidacao.join(', '));
            }
            // VALIDAÇÃO FORTE
            if (!data.departamento_destino_id || !data.sala_destino) {
                throw new Error('Departamento destino e sala destino são obrigatórios');
            }

            // BUSCAR FUNCIONÁRIO DE FORMA ROBUSTA
            const funcionarioAtual = encontrarFuncionario(data.funcionario_id);
            console.log('👤 Funcionário para transferência:', funcionarioAtual);

            if (!funcionarioAtual) {
                throw new Error(`Funcionário com ID ${data.funcionario_id} não encontrado na base de dados`);
            }

            // 1. ATUALIZAR FUNCIONÁRIO COM NOVO DEPARTAMENTO E SALA
            const dadosAtualizacaoFuncionario = {
                nome: funcionarioAtual.nome,
                cargo: funcionarioAtual.cargo,
                email: funcionarioAtual.email,
                telefone: funcionarioAtual.telefone,
                sala: data.sala_destino, // NOVA SALA
                departamento_id: parseInt(data.departamento_destino_id), // NOVO DEPARTAMENTO
                ativo: funcionarioAtual.ativo !== undefined ? funcionarioAtual.ativo : true
            };

            console.log('🔄 Atualizando funcionário com:', dadosAtualizacaoFuncionario);

            // ATUALIZAR FUNCIONÁRIO - ESTA É A PARTE MAIS IMPORTANTE
            await funcionariosService.update(parseInt(data.funcionario_id), dadosAtualizacaoFuncionario);
            console.log('✅ Funcionário atualizado com sucesso');

            // 2. BUSCAR DADOS ATUALIZADOS PARA CONFIRMAR
            const funcionarioAtualizadoResponse = await funcionariosService.getById(parseInt(data.funcionario_id));
            const funcionarioAtualizado = funcionarioAtualizadoResponse.data;

            console.log('🔄 Funcionário após atualização:', funcionarioAtualizado);

            // 3. REGISTRAR MOVIMENTAÇÃO NO HISTÓRICO
            const departamentoOrigem = departamentos.find(d =>
                d.id?.toString() === data.departamento_origem_id?.toString()
            );

            const departamentoDestino = departamentos.find(d =>
                d.id?.toString() === data.departamento_destino_id?.toString()
            );

            if (!departamentoDestino) {
                throw new Error('Departamento destino não encontrado');
            }

            const movimentacaoData = {
                funcionario_id: parseInt(data.funcionario_id),
                equipamento_id: data.equipamento_id ? parseInt(data.equipamento_id) : null,
                departamento_origem_id: data.departamento_origem_id ? parseInt(data.departamento_origem_id) : null,
                departamento_destino_id: parseInt(data.departamento_destino_id),
                funcionario_nome: funcionarioAtualizado.nome || atribuicao.funcionario_nome,
                funcionario_cargo: funcionarioAtualizado.cargo || atribuicao.cargo,
                equipamento_modelo: atribuicao.equipamento_modelo,
                equipamento_numero_serie: atribuicao.numero_serie,
                departamento_origem_nome: departamentoOrigem?.nome || atribuicao.funcionario_departamento,
                departamento_destino_nome: departamentoDestino.nome,
                sala_origem: data.sala_origem,
                sala_destino: data.sala_destino, // NOVA SALA CONFIRMADA
                observacoes: data.observacoes || `Transferência: ${data.sala_origem} → ${data.sala_destino}`,
                data_movimentacao: new Date().toISOString()
            };

            console.log('📋 Registrando movimentação:', movimentacaoData);
            await historicoMovimentacoesService.create(movimentacaoData);

            console.log('🎉 Transferência concluída com sucesso!');
            alert('Transferência realizada com sucesso!');

            // IMPORTANTE: Chamar o callback de sucesso para atualizar a lista principal
            onTransferenciaSucesso();
            onClose();

        } catch (error) {
            console.error('❌ Erro na transferência:', error);

            let mensagemErro = 'Erro ao realizar transferência';
            if (error.response?.data) {
                mensagemErro = `Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`;
            } else if (error.message) {
                mensagemErro = error.message;
            }

            alert(mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    if (!atribuicao) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Transferir entre Salas">
                <div className="text-center p-6">
                    <p className="text-red-600">Erro: Dados da atribuição não encontrados</p>
                    <Button onClick={onClose} className="mt-4">
                        Fechar
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transferir entre Salas">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Campos hidden com valores default */}
                <input type="hidden" {...register('funcionario_id')} />
                <input type="hidden" {...register('equipamento_id')} />
                <input type="hidden" {...register('departamento_origem_id')} />
                <input type="hidden" {...register('sala_origem')} />

                {/* Informações atuais */}
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-2">Situação Atual</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Funcionário:</span>
                            <p className="font-medium">{atribuicao.funcionario_nome || 'N/A'}</p>
                            <p className={`text-xs ${atribuicao.funcionario_id ? 'text-green-600' : 'text-red-600'}`}>
                                ID: {atribuicao.funcionario_id || 'NÃO ENCONTRADO'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600">Departamento Atual:</span>
                            <p className="font-medium">{atribuicao.funcionario_departamento || 'N/A'}</p>
                            <p className="text-xs text-gray-500">
                                ID: {atribuicao.departamento_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600">Sala Atual:</span>
                            <p className="font-medium">{atribuicao.funcionario_sala || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-gray-600">Equipamento:</span>
                            <p className="font-medium">{atribuicao.equipamento_modelo || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Avisos informativos */}
                {(!atribuicao.funcionario_id || !atribuicao.equipamento_id || !atribuicao.departamento_id) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700 text-sm">
                            ⚠️ <strong>Aviso:</strong> Alguns IDs não foram encontrados.
                            A transferência será registrada, mas alguns dados podem ser limitados.
                        </p>
                    </div>
                )}

                {/* Departamento e Sala Destino */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Novo Departamento *
                        </label>
                        <select
                            {...register('departamento_destino_id', {
                                required: 'Departamento destino é obrigatório'
                            })}
                            className="input mt-1"
                        >
                            <option value="">Selecionar departamento</option>
                            {departamentos.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.nome}
                                </option>
                            ))}
                        </select>
                        {errors.departamento_destino_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.departamento_destino_id.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nova Sala *
                        </label>
                        <SalaSelect
                            departamentoId={departamentoDestinoId}
                            value={salaDestino}
                            onChange={(e) => setValue('sala_destino', e.target.value, { shouldValidate: true })}
                            className="input mt-1"
                            required
                        />
                        {errors.sala_destino && (
                            <p className="mt-1 text-sm text-red-600">{errors.sala_destino.message}</p>
                        )}
                    </div>
                </div>

                {/* Observações */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Observações
                    </label>
                    <textarea
                        {...register('observacoes')}
                        rows={3}
                        className="input mt-1"
                        placeholder="Motivo da transferência..."
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        disabled={!departamentoDestinoId || !salaDestino}
                    >
                        {loading ? 'Processando...' : 'Realizar Transferência'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};