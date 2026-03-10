// pages/MinisterioPublico.jsx
import { useState, useEffect } from 'react';
import {
  Search, FileText, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, Download, Copy, ArrowRight,
  Bell, Upload, File, FileUp, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { SuccessModal } from '../components/modals/SuccessModal';

const INSTITUICOES = {
  mp: { id: 'mp', nome: 'Ministério Público', ordem: 1, cor: 'purple' },
  mj: { id: 'mj', nome: 'Ministério da Justiça', ordem: 2, cor: 'blue' },
  cm: { id: 'cm', nome: 'Câmara Municipal', ordem: 3, cor: 'green' },
  financas: { id: 'financas', nome: 'Finanças', ordem: 4, cor: 'yellow' },
  sef: { id: 'sef', nome: 'SEF', ordem: 5, cor: 'red' },
  registro: { id: 'registro', nome: 'Registro Civil', ordem: 6, cor: 'pink' }
};

export const MinisterioPublico = () => {
  const navigate = useNavigate();

  // Estados principais
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Estados para modais
  const [showAnaliseModal, setShowAnaliseModal] = useState(false);
  const [showDocumentosModal, setShowDocumentosModal] = useState(false);
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [documentos, setDocumentos] = useState([]);
  
  // Estados para upload
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Estados para notificações
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState(null);

  // Calcular processos não lidos
  const processosNaoLidos = processos.filter(p => !p.lido).length;

  const statusOptions = [
    { value: 'AGUARDANDO', label: 'Aguardando Análise', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'EM_ANALISE', label: 'Em Análise', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    { value: 'APROVADO', label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'RECUSADO', label: 'Recusado', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'EXPIRADO', label: 'Expirado', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
    { value: 'REPASSADO', label: 'Repassado', color: 'bg-purple-100 text-purple-800', icon: ArrowRight }
  ];

  // Função para calcular dias restantes
  const calcularDiasRestantes = (dataExpiracao) => {
    if (!dataExpiracao) return 0;
    const dias = differenceInDays(parseISO(dataExpiracao), new Date());
    return dias;
  };

  // Carregar processos destinados ao MP
  useEffect(() => {
    carregarProcessos();

    // Verificar expiração a cada hora
    const interval = setInterval(verificarExpiracao, 3600000);
    return () => clearInterval(interval);
  }, []);

  const carregarProcessos = () => {
    setLoading(true);
    try {
      const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');

      // Filtrar processos que estão com o MP
      const processosMP = [];

      investidores.forEach(inv => {
        if (inv.workflow?.historico) {
          // Encontrar o item do histórico que corresponde ao MP
          const itemMP = inv.workflow.historico.find(
            h => h.instituicao === 'mp' && h.status === 'AGUARDANDO'
          );

          if (itemMP) {
            processosMP.push({
              id: inv.id,
              codigo: inv.codigo_identificacao,
              nome: inv.nome_completo,
              data_nascimento: inv.data_nascimento,
              nacionalidade: inv.nacionalidade,
              sexo: inv.sexo,
              estado_civil: inv.estado_civil,
              passaporte: inv.passaporte_numero,
              passaporte_validade: inv.passaporte_validade,
              bi_numero: inv.bi_numero,
              email: inv.email,
              telefone: inv.telefone,
              endereco: inv.endereco,
              tipo: inv.tipo,
              valor: inv.valor_investimento,
              status: itemMP.status,
              lido: itemMP.lido || false,
              observacoes: itemMP.observacoes,
              data_recebimento: itemMP.data_recebimento,
              data_expiracao: new Date(new Date(itemMP.data_recebimento).setDate(
                new Date(itemMP.data_recebimento).getDate() + 30
              )).toISOString(),
              documentos: inv.documentos || [],
              investidor: inv
            });
          }
        }
      });

      // Ordenar por data (mais recentes primeiro)
      processosMP.sort((a, b) => new Date(b.data_recebimento) - new Date(a.data_recebimento));
      setProcessos(processosMP);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarExpiracao = () => {
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    let modificado = false;

    investidores.forEach(inv => {
      if (inv.workflow?.historico) {
        inv.workflow.historico.forEach(item => {
          if (item.instituicao === 'mp' && item.status === 'AGUARDANDO') {
            const dataExpiracao = new Date(item.data_recebimento);
            dataExpiracao.setDate(dataExpiracao.getDate() + 30);

            if (new Date() > dataExpiracao) {
              item.status = 'EXPIRADO';
              modificado = true;

              // Adicionar à timeline
              inv.workflow.timeline.push({
                data: new Date().toISOString(),
                evento: 'Processo expirou no Ministério Público',
                instituicao: 'mp'
              });
            }
          }
        });
      }
    });

    if (modificado) {
      localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
      carregarProcessos();
    }
  };

  const marcarComoLido = (processoId) => {
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');

    investidores.forEach(inv => {
      if (inv.id === processoId && inv.workflow?.historico) {
        inv.workflow.historico.forEach(item => {
          if (item.instituicao === 'mp' && item.status === 'AGUARDANDO') {
            item.lido = true;
          }
        });
      }
    });

    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    carregarProcessos();
  };

  const handleAnalisar = (processo) => {
    setSelectedProcesso(processo);
    setObservacoes(processo.observacoes || '');
    setUploadedFiles([]); // Resetar arquivos carregados
    setShowAnaliseModal(true);
    marcarComoLido(processo.id);
    setUltimaAtualizacao(new Date());
  };

  const handleVerDocumentos = (processo) => {
    setSelectedProcesso(processo);
    // Carregar documentos do processo
    setDocumentos(processo.documentos || []);
    setShowDocumentosModal(true);
  };

  // Função para lidar com upload de arquivos
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
      data: new Date().toISOString(),
      file: file,
      instituicao: 'mp',
      status: 'pending'
    }));

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  // Função para remover arquivo
  const handleRemoveFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
  };

  // Função para simular upload (depois substituir por chamada real)
  const handleConfirmUpload = () => {
    if (uploadedFiles.length === 0) return;

    setUploading(true);

    setTimeout(() => {
      // Salvar documentos no localStorage
      const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      
      investidores.forEach(inv => {
        if (inv.id === selectedProcesso.id) {
          if (!inv.documentos) inv.documentos = [];
          
          uploadedFiles.forEach(file => {
            const novoDoc = {
              id: file.id,
              nome: file.nome,
              tamanho: file.tamanho,
              tipo: file.tipo,
              data: file.data,
              instituicao: 'mp',
              url: URL.createObjectURL(file.file) // mock URL
            };
            inv.documentos.push(novoDoc);
          });
        }
      });

      localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
      
      setUploading(false);
      setUploadedFiles([]);
      
      // Atualizar documentos no modal se estiver aberto
      if (selectedProcesso) {
        const updatedProcesso = { ...selectedProcesso };
        const investidorAtualizado = investidores.find(i => i.id === selectedProcesso.id);
        updatedProcesso.documentos = investidorAtualizado?.documentos || [];
        setSelectedProcesso(updatedProcesso);
      }

      alert('Documentos enviados com sucesso!');
    }, 2000);
  };

  const handleDecisao = (aprovado) => {
    if (!selectedProcesso) return;

    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');

    investidores.forEach(inv => {
      if (inv.id === selectedProcesso.id && inv.workflow?.historico) {
        const itemMP = inv.workflow.historico.find(
          h => h.instituicao === 'mp' && h.status === 'AGUARDANDO'
        );

        if (itemMP) {
          itemMP.status = aprovado ? 'APROVADO' : 'RECUSADO';
          itemMP.data_analise = new Date().toISOString();
          itemMP.observacoes = observacoes;

          if (aprovado) {
            // Encaminhar para MJ
            itemMP.encaminhado_para = 'mj';
            inv.workflow.historico.push({
              instituicao: 'mj',
              data_recebimento: new Date().toISOString(),
              data_analise: null,
              status: 'AGUARDANDO',
              observacoes: '',
              encaminhado_para: null,
              lido: false
            });
            inv.workflow.instituicao_atual = 'mj';
            inv.workflow.timeline.push({
              data: new Date().toISOString(),
              evento: 'MP aprovou e encaminhou para Ministério da Justiça',
              instituicao: 'mp'
            });
            inv.workflow.timeline.push({
              data: new Date().toISOString(),
              evento: 'Processo recebido pelo Ministério da Justiça',
              instituicao: 'mj'
            });
          } else {
            inv.workflow.status_global = 'recusado';
            inv.workflow.timeline.push({
              data: new Date().toISOString(),
              evento: 'MP recusou o processo',
              instituicao: 'mp'
            });
          }
        }
      }
    });

    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));

    setShowAnaliseModal(false);
    setSelectedProcesso(null);
    carregarProcessos();

    setSuccessMessage(
      aprovado
        ? 'Processo aprovado e encaminhado para o Ministério da Justiça!'
        : 'Processo recusado!'
    );
  };

  // Funções auxiliares para formatação
  const formatSexo = (sexo) => {
    const map = { M: 'Masculino', F: 'Feminino', O: 'Outro' };
    return map[sexo] || sexo;
  };

  const formatEstadoCivil = (estado) => {
    const map = {
      SOLTEIRO: 'Solteiro(a)',
      CASADO: 'Casado(a)',
      DIVORCIADO: 'Divorciado(a)',
      VIUVO: 'Viúvo(a)',
      'UNIÃO ESTÁVEL': 'União Estável'
    };
    return map[estado] || estado;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      {/* Cabeçalho com notificações */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ministério Público</h1>
          <p className="text-gray-600">Análise de processos de investimento</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Relógio de atualização */}
          <div className="text-sm text-gray-500">
            Atualizado: {format(ultimaAtualizacao, 'HH:mm')}
          </div>

          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotificacoes(!showNotificacoes)}
              className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Bell className="w-6 h-6" />
              {processosNaoLidos > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                  {processosNaoLidos}
                </span>
              )}
            </button>

            {/* Dropdown de notificações */}
            {showNotificacoes && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                  <h3 className="font-semibold text-gray-700">Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {processosNaoLidos === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Nenhuma notificação nova
                    </div>
                  ) : (
                    processos.filter(p => !p.lido).map(p => (
                      <div
                        key={p.id}
                        className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          handleAnalisar(p);
                          setShowNotificacoes(false);
                        }}
                      >
                        <p className="font-medium text-sm">{p.nome}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Código: {p.codigo}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(parseISO(p.data_recebimento), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar por nome, código ou passaporte..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Processos */}
      {processos.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo pendente</h3>
          <p className="mt-1 text-sm text-gray-500">
            Todos os processos foram analisados ou encaminhados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {processos
            .filter(p => {
              const termo = searchTerm.toLowerCase();
              return !termo ||
                p.nome.toLowerCase().includes(termo) ||
                p.codigo.toLowerCase().includes(termo) ||
                p.passaporte.toLowerCase().includes(termo);
            })
            .map(processo => {
              const diasRestantes = calcularDiasRestantes(processo.data_expiracao);
              const StatusIcon = statusOptions.find(s => s.value === processo.status)?.icon || Clock;

              return (
                <div
                  key={processo.id}
                  className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow ${!processo.lido ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {processo.codigo}
                        </span>
                        {!processo.lido && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Novo
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mt-2">
                        {processo.nome}
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Nacionalidade</p>
                          <p className="text-sm font-medium">{processo.nacionalidade}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Passaporte</p>
                          <p className="text-sm font-mono">{processo.passaporte}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Valor</p>
                          <p className="text-sm font-medium">
                            ${processo.valor?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tipo</p>
                          <p className="text-sm">{processo.tipo}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOptions.find(s => s.value === processo.status)?.color
                          }`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusOptions.find(s => s.value === processo.status)?.label}
                        </span>

                        {processo.status === 'AGUARDANDO' && (
                          <span className={`text-xs ${diasRestantes <= 5 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                            {diasRestantes <= 0 ? 'Expirado' : `${diasRestantes} dias restantes`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <button
                        onClick={() => handleVerDocumentos(processo)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ver documentos"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleAnalisar(processo)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Analisar processo"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Modal de Análise */}
      <Modal
        isOpen={showAnaliseModal}
        onClose={() => {
          setShowAnaliseModal(false);
          setUploadedFiles([]);
        }}
        title="Analisar Processo"
        size="lg"
      >
        {selectedProcesso && (
          <div className="space-y-6">
            {/* Informações completas do processo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Informações Completas do Processo</h4>
              
              {/* Dados Pessoais */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Dados Pessoais</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Nome Completo</p>
                    <p className="text-sm font-medium">{selectedProcesso.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Data Nascimento</p>
                    <p className="text-sm">{format(parseISO(selectedProcesso.data_nascimento), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nacionalidade</p>
                    <p className="text-sm">{selectedProcesso.nacionalidade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sexo</p>
                    <p className="text-sm">{formatSexo(selectedProcesso.sexo)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estado Civil</p>
                    <p className="text-sm">{formatEstadoCivil(selectedProcesso.estado_civil)}</p>
                  </div>
                </div>
              </div>

              {/* Documentos de Identificação */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Documentos de Identificação</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Passaporte</p>
                    <p className="text-sm font-mono">{selectedProcesso.passaporte}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Validade</p>
                    <p className="text-sm">{format(parseISO(selectedProcesso.passaporte_validade), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">BI</p>
                    <p className="text-sm font-mono">{selectedProcesso.bi_numero || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Contacto</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm">{selectedProcesso.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Telefone</p>
                    <p className="text-sm">{selectedProcesso.telefone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Endereço</p>
                    <p className="text-sm">{selectedProcesso.endereco || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Investimento */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Informações do Investimento</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="text-sm">{selectedProcesso.tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="text-sm font-semibold text-green-600">
                      ${selectedProcesso.valor?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Recebido em</p>
                    <p className="text-sm">{format(parseISO(selectedProcesso.data_recebimento), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentos existentes */}
            {selectedProcesso.documentos && selectedProcesso.documentos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Documentos Anexados</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {selectedProcesso.documentos.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{doc.nome}</p>
                          <p className="text-xs text-gray-500">
                            {format(parseISO(doc.data), 'dd/MM/yyyy HH:mm')} • {formatBytes(doc.tamanho)}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => window.open(doc.url, '_blank')}>
                        <Download className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload de novos documentos */}
            <div>
              <h4 className="font-medium mb-2">Anexar Novos Documentos</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <FileUp className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label className="cursor-pointer text-blue-600 hover:text-blue-800">
                      <span>Clique para selecionar arquivos</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (máx. 10MB por arquivo)
                    </p>
                  </div>
                </div>

                {/* Lista de arquivos selecionados */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium">{file.nome}</p>
                            <p className="text-xs text-gray-500">{formatBytes(file.tamanho)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleConfirmUpload}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Enviar Documentos
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações / Parecer
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="input w-full"
                rows="4"
                placeholder="Adicione observações sobre sua decisão..."
              />
            </div>

            {/* Próxima instituição */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center text-blue-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  Após aprovação, será encaminhado para: <strong>Ministra da Justiça</strong>
                </span>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAnaliseModal(false);
                  setUploadedFiles([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDecisao(false)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Recusar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDecisao(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar e Encaminhar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Documentos */}
      <Modal
        isOpen={showDocumentosModal}
        onClose={() => setShowDocumentosModal(false)}
        title="Documentos do Processo"
        size="lg"
      >
        {selectedProcesso && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="text-sm text-gray-600">Processo</p>
                <p className="font-medium">{selectedProcesso.nome}</p>
              </div>
              <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                {selectedProcesso.codigo}
              </span>
            </div>

            <div className="space-y-2">
              {documentos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum documento anexado
                </div>
              ) : (
                documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.nome}</p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(doc.data), 'dd/MM/yyyy HH:mm')} • {doc.instituicao?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => window.open(doc.url, '_blank')}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowDocumentosModal(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <SuccessModal
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
};