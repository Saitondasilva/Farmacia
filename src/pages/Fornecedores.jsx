import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, FileText, Eye, Send, 
  CheckCircle, XCircle, Clock, AlertCircle, Download, 
  Users, Flag, Copy 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// Dados Mock
const MOCK_INVESTIDORES = [
  {
    id: 1,
    codigo_identificacao: 'INV-20250303-0001',
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
    observacoes: 'Investidor VIP',
    preenchimento_automatico: false,
    workflow: {
      status_global: 'em_andamento',
      instituicao_atual: 'ucid',
      historico: [],
      timeline: []
    }
  },
  {
    id: 2,
    codigo_identificacao: 'INV-20250303-0002',
    nome_completo: 'Maria Fernanda Costa',
    data_nascimento: '1990-02-20',
    nacionalidade: 'Brasileira',
    sexo: 'F',
    estado_civil: 'SOLTEIRO',
    passaporte_numero: 'BR998877',
    passaporte_validade: '2029-05-10',
    bi_numero: '',
    email: 'maria.costa@email.com',
    telefone: '+551199999999',
    endereco: 'São Paulo, Brasil',
    tipo: 'DOAÇÃO',
    valor_investimento: 90000,
    status: 'ENVIADO',
    observacoes: '',
    preenchimento_automatico: false,
    workflow: {
      status_global: 'em_andamento',
      instituicao_atual: 'mp',
      historico: [
        {
          instituicao: 'mp',
          data_recebimento: '2025-03-03T10:30:00',
          data_analise: null,
          status: 'AGUARDANDO',
          observacoes: '',
          encaminhado_para: null,
          lido: false
        }
      ],
      timeline: [
        { data: '2025-03-03T10:30:00', evento: 'Enviado para Ministério Público', instituicao: 'ucid' }
      ]
    }
  }
];

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

const instituicoesDisponiveis = [
  { id: 'mp', nome: 'Ministério Público' },
  { id: 'mj', nome: 'Ministério da Justiça' },
  { id: 'cm', nome: 'Câmara Municipal' },
  { id: 'financas', nome: 'Finanças' },
  { id: 'sef', nome: 'SEF' },
  { id: 'registro', nome: 'Registro Civil' }
];

export const Investidores = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [investidores, setInvestidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Estados para modais
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showDocumentosModal, setShowDocumentosModal] = useState(false);
  const [showEnviarModal, setShowEnviarModal] = useState(false);
  const [selectedInvestidor, setSelectedInvestidor] = useState(null);
  const [investidorSelecionado, setInvestidorSelecionado] = useState(null);
  
  // Estados para documentos
  const [documentos, setDocumentos] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [instituicoesSelecionadas, setInstituicoesSelecionadas] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  const statusOptions = [
    { value: 'PENDENTE', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'EM VERIFICAÇÃO', label: 'Em Verificação', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    { value: 'APROVADO', label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'REJEITADO', label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'ENVIADO', label: 'Enviado para Instituição', color: 'bg-purple-100 text-purple-800', icon: Send },
    { value: 'SUSPENSO', label: 'Suspenso', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
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

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      
      if (stored.length === 0) {
        setInvestidores(MOCK_INVESTIDORES);
        localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(MOCK_INVESTIDORES));
      } else {
        setInvestidores(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setInvestidores(MOCK_INVESTIDORES);
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentos = (investidorId) => {
    const docs = MOCK_DOCUMENTOS.filter(d => d.investidor_id === investidorId);
    setDocumentos(docs);
  };

  const save = (next) => {
    setInvestidores(next);
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(next));
  };

  // Handlers de navegação
  const handleCreate = () => navigate('/formulario-investimento');
  const handleEdit = (inv) => navigate(`/formulario-investimento?id=${inv.id}`);

  // Handlers de ações
  const handleDelete = (id) => {
    if (!confirm('Tem certeza que deseja eliminar este investidor?')) return;
    save(investidores.filter(i => i.id !== id));
  };

  const handleViewDetalhes = (investidor) => {
    setSelectedInvestidor(investidor);
    setShowDetalhesModal(true);
  };

  const handleDocumentos = (investidor) => {
    setSelectedInvestidor(investidor);
    loadDocumentos(investidor.id);
    setShowDocumentosModal(true);
  };

  const handleUploadDocumento = (e, investidorId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    setTimeout(() => {
      setDocumentos(prev => [
        ...prev,
        {
          id: Date.now(),
          investidor_id: investidorId,
          nome_arquivo: file.name,
          tipo: 'OUTROS',
          data_envio: new Date().toISOString()
        }
      ]);
      setUploadingDoc(false);
      alert('Documento enviado com sucesso!');
    }, 800);
  };

  const handleDownloadDocumento = (documento) => {
    alert(`Download do ficheiro: ${documento.nome_arquivo}`);
  };

  const handleEnviarParaInstituicao = (investidorId, instituicoes) => {
    if (!confirm('Deseja enviar este investidor para as instituições?')) return;

    const dataEnvio = new Date().toISOString();
    
    const updated = investidores.map(inv => {
      if (inv.id === investidorId) {
        // Criar histórico de envios
        const historico = instituicoes.map(inst => ({
          instituicao: inst.id,
          data_recebimento: dataEnvio,
          data_analise: null,
          status: 'AGUARDANDO',
          observacoes: '',
          encaminhado_para: null,
          lido: false
        }));

        // Criar timeline
        const timeline = instituicoes.map(inst => ({
          data: dataEnvio,
          evento: `Enviado para ${inst.nome}`,
          instituicao: 'ucid'
        }));

        return {
          ...inv,
          status: 'ENVIADO',
          workflow: {
            status_global: 'em_andamento',
            instituicao_atual: instituicoes[0]?.id || '',
            historico: [...(inv.workflow?.historico || []), ...historico],
            timeline: [...(inv.workflow?.timeline || []), ...timeline]
          }
        };
      }
      return inv;
    });

    save(updated);
    alert('Investidor enviado com sucesso!');
  };

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleInstituicao = (instituicao) => {
    setInstituicoesSelecionadas((prev) =>
      prev.includes(instituicao)
        ? prev.filter((i) => i !== instituicao)
        : [...prev, instituicao]
    );
  };

  // Filtros
  const filteredInvestidores = investidores.filter(investidor => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || (
      investidor.nome_completo?.toLowerCase().includes(q) ||
      investidor.email?.toLowerCase().includes(q) ||
      investidor.passaporte_numero?.toLowerCase().includes(q) ||
      investidor.bi_numero?.toLowerCase().includes(q) ||
      investidor.codigo_identificacao?.toLowerCase().includes(q)
    );
    const matchesStatus = !filterStatus || investidor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Utilitários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const canViewDocuments = (status) => {
    return status === 'ENVIADO';
  };

  const canSendToInstitution = (status) => {
    return status !== 'ENVIADO' && status !== 'APROVADO' && status !== 'REJEITADO';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investidores</h1>
          <p className="text-gray-600">Gerir investidores e acompanhar processos</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Investidor
        </Button>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar por nome, email, passaporte, BI ou código..."
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

      {/* Lista Mobile */}
      {filteredInvestidores.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum investidor encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus ? 'Tente alterar os filtros de pesquisa.' : 'Comece por adicionar um novo investidor.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="sm:hidden space-y-3">
            {filteredInvestidores.map(inv => {
              const StatusIcon = statusOptions.find(s => s.value === inv.status)?.icon || AlertCircle;
              return (
                <div key={inv.id} className="border rounded-lg p-3 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {inv.codigo_identificacao || 'N/A'}
                        </span>
                        {inv.codigo_identificacao && (
                          <button
                            onClick={() => copyToClipboard(inv.codigo_identificacao, inv.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="font-medium text-gray-900 mt-1">{inv.nome_completo}</div>
                      <div className="text-sm text-gray-500">{inv.nacionalidade}</div>
                      <div className="text-sm font-mono text-gray-700 mt-1">{inv.passaporte_numero}</div>
                      {inv.passaporte_validade && (
                        <div className="text-xs text-gray-500">Validade: {formatDate(inv.passaporte_validade)}</div>
                      )}
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusOptions.find(s => s.value === inv.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusOptions.find(s => s.value === inv.status)?.label || inv.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.tipo === 'INVESTIMENTO' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {inv.tipo === 'INVESTIMENTO' ? 'Investimento' : 'Doação'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewDetalhes(inv)} className="text-green-600 hover:text-green-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDocumentos(inv)} className="text-blue-600 hover:text-blue-900">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(inv)} className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Nome Completo</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Nacionalidade</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Passaporte</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Valor (USD)</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvestidores.map(inv => {
                  const StatusIcon = statusOptions.find(s => s.value === inv.status)?.icon || AlertCircle;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {inv.codigo_identificacao || 'N/A'}
                          </span>
                          {inv.codigo_identificacao && (
                            <button
                              onClick={() => copyToClipboard(inv.codigo_identificacao, inv.id)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copiar código"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedCode === inv.id && (
                                <span className="absolute mt-6 ml-4 text-xs text-green-600 bg-white px-1 rounded shadow">
                                  Copiado!
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium whitespace-nowrap">{inv.nome_completo}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Flag className="w-3 h-3 mr-1" />
                          {inv.nacionalidade}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-mono text-sm">{inv.passaporte_numero}</div>
                        {inv.passaporte_validade && (
                          <div className="text-xs text-gray-500">Validade: {formatDate(inv.passaporte_validade)}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inv.tipo === 'INVESTIMENTO' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {inv.tipo === 'INVESTIMENTO' ? 'Investimento' : 'Doação'}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold whitespace-nowrap">
                        {formatCurrency(inv.valor_investimento)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusOptions.find(s => s.value === inv.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusOptions.find(s => s.value === inv.status)?.label || inv.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetalhes(inv)}
                            className="text-green-600 hover:text-green-900"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDocumentos(inv)}
                            className={`${canViewDocuments(inv.status) ? 'text-blue-600 hover:text-blue-900' : 'text-gray-300 cursor-not-allowed'}`}
                            title="Ver documentos"
                            disabled={!canViewDocuments(inv.status)}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {canSendToInstitution(inv.status) && (
                            <button
                              onClick={() => {
                                setInvestidorSelecionado(inv);
                                setShowEnviarModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900"
                              title="Enviar para instituições"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(inv)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal de Envio */}
      <Modal
        isOpen={showEnviarModal}
        onClose={() => {
          setShowEnviarModal(false);
          setInstituicoesSelecionadas([]);
        }}
        title="Confirmar Envio para Instituições"
      >
        {investidorSelecionado && (
          <>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Investidor:</p>
              <p className="font-medium">{investidorSelecionado.nome_completo}</p>
              <p className="text-sm text-gray-600 mt-2">Código:</p>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-blue-700 bg-white px-2 py-1 rounded border">
                  {investidorSelecionado.codigo_identificacao}
                </span>
                <button
                  onClick={() => copyToClipboard(investidorSelecionado.codigo_identificacao, 'modal')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="mb-4">
              Selecione as instituições para enviar o processo:
            </p>

            <div className="space-y-2 mb-4">
              {instituicoesDisponiveis.map((inst) => (
                <label
                  key={inst.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={instituicoesSelecionadas.includes(inst)}
                    onChange={() => toggleInstituicao(inst)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span>{inst.nome}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEnviarModal(false);
                  setInstituicoesSelecionadas([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={instituicoesSelecionadas.length === 0}
                onClick={() => {
                  handleEnviarParaInstituicao(investidorSelecionado.id, instituicoesSelecionadas);
                  setInstituicoesSelecionadas([]);
                  setShowEnviarModal(false);
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Confirmar Envio
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        title="Informações Completas do Investidor"
        size="lg"
      >
        {selectedInvestidor && (
          <div className="space-y-6">
            {/* Código em destaque */}
            {selectedInvestidor.codigo_identificacao && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-blue-700">Código de identificação:</span>
                    <span className="ml-2 font-mono font-bold text-blue-800">{selectedInvestidor.codigo_identificacao}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedInvestidor.codigo_identificacao, 'detalhes')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Timeline do processo */}
            {selectedInvestidor.workflow?.timeline?.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Linha do Tempo</h4>
                <div className="space-y-2">
                  {selectedInvestidor.workflow.timeline.slice(-5).map((evento, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-600">{evento.evento}</p>
                        <p className="text-xs text-gray-400">
                          {format(parseISO(evento.data), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações Pessoais */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{selectedInvestidor.nome_completo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{formatDate(selectedInvestidor.data_nascimento)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nacionalidade</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{selectedInvestidor.nacionalidade}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sexo</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {sexoOptions.find(s => s.value === selectedInvestidor.sexo)?.label || selectedInvestidor.sexo}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {estadoCivilOptions.find(s => s.value === selectedInvestidor.estado_civil)?.label || selectedInvestidor.estado_civil}
                  </p>
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Documentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número do Passaporte</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border font-mono">{selectedInvestidor.passaporte_numero}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Validade do Passaporte</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{formatDate(selectedInvestidor.passaporte_validade)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número do BI</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{selectedInvestidor.bi_numero || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{selectedInvestidor.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{selectedInvestidor.telefone || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border whitespace-pre-line">
                    {selectedInvestidor.endereco || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Investimento */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Informações de Investimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {tipoInvestimentoOptions.find(t => t.value === selectedInvestidor.tipo)?.label || selectedInvestidor.tipo}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor do Investimento</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border font-semibold">
                    {formatCurrency(selectedInvestidor.valor_investimento)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    statusOptions.find(s => s.value === selectedInvestidor.status)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {statusOptions.find(s => s.value === selectedInvestidor.status)?.label || selectedInvestidor.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preenchimento Automático</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {selectedInvestidor.preenchimento_automatico ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
            </div>

            {/* Observações */}
            {selectedInvestidor.observacoes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Observações</h3>
                <p className="p-3 bg-gray-50 rounded border whitespace-pre-line">
                  {selectedInvestidor.observacoes}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowDetalhesModal(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Documentos */}
      <Modal
        isOpen={showDocumentosModal}
        onClose={() => setShowDocumentosModal(false)}
        title="Documentos do Investidor"
        size="lg"
      >
        {selectedInvestidor && (
          <div className="space-y-4">
            {/* Código do investidor */}
            {selectedInvestidor.codigo_identificacao && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Código:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold">{selectedInvestidor.codigo_identificacao}</span>
                  <button
                    onClick={() => copyToClipboard(selectedInvestidor.codigo_identificacao, 'documentos')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Status dos documentos */}
            <div className={`p-3 rounded-lg ${selectedInvestidor.status === 'ENVIADO'
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center">
                {selectedInvestidor.status === 'ENVIADO' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Documentos disponíveis para as instituições
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">
                      Documentos só estarão disponíveis após envio para instituições
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Upload de documentos */}
            {selectedInvestidor.status !== 'ENVIADO' && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Enviar Documento</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar arquivo
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleUploadDocumento(e, selectedInvestidor.id)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    disabled={uploadingDoc}
                  />
                  {uploadingDoc && (
                    <div className="mt-2 flex items-center text-blue-600">
                      <LoadingSpinner size="sm" className="mr-2" />
                      <span className="text-sm">Enviando documento...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lista de documentos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Documentos {selectedInvestidor.status === 'ENVIADO' ? 'Disponíveis' : 'Enviados'}
              </h3>
              {documentos.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedInvestidor.status === 'ENVIADO'
                      ? 'Não existem documentos disponíveis.'
                      : 'Envie documentos para visualização.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documentos.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.nome_arquivo}</p>
                          <p className="text-xs text-gray-500">
                            {doc.tipo} • {formatDate(doc.data_envio)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadDocumento(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};