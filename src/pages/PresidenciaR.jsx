// pages/PresidenciaRepublica.jsx
import { useState, useEffect } from 'react';
import {
    Search, FileText, Eye, CheckCircle, XCircle,
    Clock, AlertCircle, Download, Upload, Award,
    Bell, ArrowRight, FileCheck, User, Calendar,
    Hash, FileSignature, Globe, Briefcase, Mail, Phone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UploadRelatorio } from '../components/UploadRelatorio'; // <-- IMPORT ADICIONADO
import { SuccessModal } from '../components/modals/SuccessModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';

export const PresidenciaRepublica = () => {
    const [processos, setProcessos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProcesso, setSelectedProcesso] = useState(null);
    const [showPromulgacaoModal, setShowPromulgacaoModal] = useState(false);
    const [relatorio, setRelatorio] = useState(null);
    const [observacoes, setObservacoes] = useState('');
    const [successMessage, setSuccessMessage] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [documentosDisponiveis, setDocumentosDisponiveis] = useState([]);

    useEffect(() => {
        carregarProcessos();
    }, []);

    const carregarProcessos = () => {
        setLoading(true);
        try {
            const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');

            const processosPR = [];

            investidores.forEach(inv => {
                if (inv.workflow?.historico) {
                    const itemPR = inv.workflow.historico.find(
                        h => h.instituicao === 'pr' && h.status === 'AGUARDANDO'
                    );

                    if (itemPR) {
                        processosPR.push({
                            id: inv.id,
                            codigo: inv.codigo_identificacao,
                            nome: inv.nome_completo,
                            nacionalidade: inv.nacionalidade,
                            passaporte: inv.passaporte_numero,
                            passaporte_validade: inv.passaporte_validade,
                            data_nascimento: inv.data_nascimento,
                            email: inv.email,
                            telefone: inv.telefone,
                            endereco: inv.endereco,
                            sexo: inv.sexo,
                            estado_civil: inv.estado_civil,
                            valor: inv.valor_investimento,
                            tipo: inv.tipo,
                            data_recebimento: itemPR.data_recebimento,
                            status: itemPR.status,
                            lido: itemPR.lido || false,
                            observacoes_cj: inv.workflow.historico.find(h => h.instituicao === 'cj')?.observacoes || '',
                            relatorio_cj: inv.documentos?.find(d => d.tipo === 'RELATORIO_CJ'),
                            investidor: inv,
                            documentos: inv.documentos || []
                        });
                    }
                }
            });

            setProcessos(processosPR);
        } catch (error) {
            console.error('Erro ao carregar processos:', error);
        } finally {
            setLoading(false);
        }
    };

    const carregarDocumentosProcesso = (processo) => {
        const docs = [];

        // Documentos básicos
        if (processo.passaporte) {
            docs.push({
                id: 'passaporte',
                nome: `Passaporte_${processo.codigo}.pdf`,
                tipo: 'Passaporte',
                data: processo.data_recebimento,
                icon: FileText
            });
        }

        // Relatório do CJ
        if (processo.relatorio_cj) {
            docs.push({
                id: 'relatorio_cj',
                nome: processo.relatorio_cj.nome || 'Relatório_CJ.pdf',
                tipo: 'Relatório do Conselho da Justiça',
                data: processo.relatorio_cj.data || processo.data_recebimento,
                icon: FileText
            });
        }

        // Outros documentos
        if (processo.documentos) {
            processo.documentos.forEach(doc => {
                if (doc.tipo !== 'RELATORIO_PROMULGACAO') {
                    docs.push({
                        id: doc.id,
                        nome: doc.nome,
                        tipo: doc.tipo === 'RELATORIO_CJ' ? 'Relatório CJ' : 'Documento',
                        data: doc.data,
                        icon: FileText
                    });
                }
            });
        }

        setDocumentosDisponiveis(docs);
    };

    const handlePromulgar = (processo) => {
        setSelectedProcesso(processo);
        carregarDocumentosProcesso(processo);
        setObservacoes('');
        setRelatorio(null);
        setShowPromulgacaoModal(true);

        // Marcar como lido
        const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
        investidores.forEach(inv => {
            if (inv.id === processo.id && inv.workflow?.historico) {
                inv.workflow.historico.forEach(item => {
                    if (item.instituicao === 'pr') item.lido = true;
                });
            }
        });
        localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
        carregarProcessos();
    };

    const handleUploadRelatorio = (relatorio) => {
        console.log('OBJETO COMPLETO RECEBIDO:', relatorio);

        // O objeto já vem com .nome direto
        if (relatorio?.nome) {
            console.log('Usando objeto como recebido');
            setRelatorio(relatorio);
        } else if (relatorio?.name) {
            console.log('Criando objeto a partir de .name');
            setRelatorio({
                nome: relatorio.name,
                tamanho: relatorio.size || 0,
                type: relatorio.type || '',
                lastModified: relatorio.lastModified || 0,
                ...relatorio
            });
        } else {
            console.log('Formato não reconhecido, salvando direto:', relatorio);
            setRelatorio(relatorio);
        }
    };

    const handleConfirmarPromulgacao = () => {
        console.log('handleConfirmarPromulgacao chamado');
        console.log('selectedProcesso:', selectedProcesso);
        console.log('relatorio:', relatorio);

        if (!selectedProcesso || !relatorio) {
            console.log('Bloqueado por falta de:', {
                selectedProcesso: !selectedProcesso,
                relatorio: !relatorio
            });
            setSuccessMessage('Por favor, anexe o relatório de promulgação antes de concluir.');
            return;
        }

        console.log('Passou na validação, abrindo confirm modal');
        setShowConfirmModal(true);
    };
    const handleConcluirPromulgacao = () => {
        if (!selectedProcesso || !relatorio) return;

        const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');

        investidores.forEach(inv => {
            if (inv.id === selectedProcesso.id && inv.workflow?.historico) {
                // Atualizar item do PR
                const itemPR = inv.workflow.historico.find(h => h.instituicao === 'pr');
                if (itemPR) {
                    itemPR.status = 'APROVADO';
                    itemPR.data_analise = new Date().toISOString();
                    itemPR.observacoes = observacoes;
                    itemPR.relatorio_promulgacao = relatorio.name;
                    itemPR.encaminhado_para = 'ucid';
                }

                // Adicionar relatório aos documentos
                if (!inv.documentos) inv.documentos = [];
                inv.documentos.push({
                    id: Date.now(),
                    nome: relatorio.name,
                    tipo: 'RELATORIO_PROMULGACAO',
                    data: new Date().toISOString(),
                    investidor_id: inv.id,
                    tamanho: relatorio.tamanho
                });

                // Criar item para o UCID (retorno)
                inv.workflow.historico.push({
                    instituicao: 'ucid',
                    data_recebimento: new Date().toISOString(),
                    data_analise: null,
                    status: 'AGUARDANDO',
                    observacoes: 'Processo promulgado, aguardando impressão',
                    encaminhado_para: null,
                    lido: false
                });

                inv.workflow.instituicao_atual = 'ucid';
                inv.status = 'APROVADO';

                // Timeline
                if (!inv.workflow.timeline) inv.workflow.timeline = [];
                inv.workflow.timeline.push({
                    data: new Date().toISOString(),
                    evento: 'PR promulgou o processo e anexou relatório',
                    instituicao: 'pr'
                });

                inv.workflow.timeline.push({
                    data: new Date().toISOString(),
                    evento: 'Processo retornou ao UCID para impressão',
                    instituicao: 'pr'
                });
            }
        });

        localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));

        setShowConfirmModal(false);
        setShowPromulgacaoModal(false);
        setRelatorio(null);
        carregarProcessos();

        setSuccessMessage('Processo promulgado com sucesso e enviado de volta ao UCID para impressão!');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy');
        } catch {
            return dateString;
        }
    };

    const getSexoLabel = (sexo) => {
        const map = { M: 'Masculino', F: 'Feminino', O: 'Outro' };
        return map[sexo] || sexo;
    };

    const getEstadoCivilLabel = (estado) => {
        const map = {
            SOLTEIRO: 'Solteiro(a)',
            CASADO: 'Casado(a)',
            DIVORCIADO: 'Divorciado(a)',
            VIUVO: 'Viúvo(a)',
            'UNIÃO ESTÁVEL': 'União Estável'
        };
        return map[estado] || estado;
    };

    if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-10" />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Presidência da República</h1>
                    <p className="text-gray-600">Promulgação de processos de investimento</p>
                </div>
            </div>

            {/* Filtro */}
            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, código ou passaporte..."
                        className="input pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Lista */}
            {processos.length === 0 ? (
                <div className="text-center py-12">
                    <Award className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo para promulgação</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Todos os processos foram promulgados ou encaminhados.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {processos
                        .filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(p => (
                            <div key={p.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {p.codigo}
                                            </span>
                                            {!p.lido && (
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    Novo
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-medium mt-2">{p.nome}</h3>
                                        <p className="text-sm text-gray-500">{p.nacionalidade} • {p.passaporte}</p>
                                        <div className="flex items-center mt-1 text-xs text-green-600">
                                            <FileCheck className="w-3 h-3 mr-1" />
                                            Relatório do CJ anexado
                                        </div>
                                    </div>
                                    <Button onClick={() => handlePromulgar(p)}>
                                        <Award className="w-4 h-4 mr-2" />
                                        Promulgar
                                    </Button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Modal de Promulgação */}
            <Modal isOpen={showPromulgacaoModal} onClose={() => setShowPromulgacaoModal(false)} title="Promulgação de Processo" size="lg">
                {selectedProcesso && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                        {/* Cabeçalho */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium mb-2">Processo: {selectedProcesso.codigo}</h4>
                            <p className="text-sm">{selectedProcesso.nome}</p>
                        </div>

                        {/* Detalhes completos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Nome Completo</p>
                                        <p className="font-medium">{selectedProcesso.nome}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Data Nascimento</p>
                                        <p>{formatDate(selectedProcesso.data_nascimento)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Nacionalidade</p>
                                        <p>{selectedProcesso.nacionalidade}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Sexo</p>
                                        <p>{getSexoLabel(selectedProcesso.sexo)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <FileSignature className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Passaporte</p>
                                        <p className="font-mono">{selectedProcesso.passaporte}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p>{selectedProcesso.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Telefone</p>
                                        <p>{selectedProcesso.telefone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Estado Civil</p>
                                        <p>{getEstadoCivilLabel(selectedProcesso.estado_civil)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Observações do CJ */}
                        {selectedProcesso.observacoes_cj && (
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <p className="text-xs text-yellow-600 font-medium">Observações do Conselho da Justiça</p>
                                <p className="text-sm mt-1">{selectedProcesso.observacoes_cj}</p>
                            </div>
                        )}

                        {/* Documentos disponíveis */}
                        <div>
                            <h4 className="font-medium mb-3">Documentos do Processo</h4>
                            <div className="space-y-2">
                                {documentosDisponiveis.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-blue-500 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium">{doc.nome}</p>
                                                <p className="text-xs text-gray-500">
                                                    {doc.tipo} • {formatDate(doc.data)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upload Relatório */}
                        <div>
                            <h4 className="font-medium mb-3">Anexar Relatório de Promulgação *</h4>
                            <UploadRelatorio
                                onUpload={handleUploadRelatorio}
                                instituicao="PR"
                                processoId={selectedProcesso.id}
                                tipo="RELATORIO_PROMULGACAO"
                            />
                            {relatorio && (
                                <div className="mt-2 flex items-center text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Relatório anexado: {relatorio.nome}
                                </div>
                            )}
                        </div>

                        {/* Observações */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Observações da Promulgação</label>
                            <textarea
                                className="input w-full"
                                rows="3"
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                placeholder="Registe observações sobre a promulgação..."
                            />
                        </div>

                        {/* Informação de retorno */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-700 flex items-center">
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Após promulgação, o processo retornará ao UCID para impressão.
                            </p>
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button variant="secondary" onClick={() => setShowPromulgacaoModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleConfirmarPromulgacao} disabled={!relatorio}>
                                <Award className="w-4 h-4 mr-2" />
                                Promulgar Processo
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Confirmação */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}  // Essa é a função de cancelar
                onConfirm={handleConcluirPromulgacao}
                title="Confirmar Promulgação"
                message="Tem certeza que deseja promulgar este processo? Esta ação não pode ser desfeita."
                confirmText="Sim, Promulgar"
                cancelText="Voltar"
            />

            {/* Modal de Sucesso */}
            <SuccessModal
                message={successMessage}
                onClose={() => setSuccessMessage(null)}
            />
        </div>
    );
};