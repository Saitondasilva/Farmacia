import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Eye, Send, CheckCircle, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
//import { investidoresService } from '../services/investidoresService';
//import { documentosService } from '../services/documentosService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    email: 'joao@email.com',
    telefone: '+351912345678',
    endereco: 'Lisboa, Portugal',
    tipo: 'INVESTIMENTO',
    valor_investimento: 150000,
    status: 'PENDENTE',
    observacoes: 'Investidor VIP',
    preenchimento_automatico: false
  },
  {
    id: 2,
    nome_completo: 'Maria Fernanda Costa',
    data_nascimento: '1990-02-20',
    nacionalidade: 'Brasileira',
    sexo: 'F',
    estado_civil: 'SOLTEIRO',
    passaporte_numero: 'BR998877',
    passaporte_validade: '2029-05-10',
    bi_numero: '',
    email: 'maria@email.com',
    telefone: '+551199999999',
    endereco: 'São Paulo, Brasil',
    tipo: 'DOAÇÃO',
    valor_investimento: 90000,
    status: 'ENVIADO',
    observacoes: '',
    preenchimento_automatico: false
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


export const Investidores = () => {
  const [investidores, setInvestidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showDocumentosModal, setShowDocumentosModal] = useState(false);
  const [selectedInvestidor, setSelectedInvestidor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const statusOptions = [
    { value: 'PENDENTE', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'EM VERIFICAÇÃO', label: 'Em Verificação', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    { value: 'APROVADO', label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'REJEITADO', label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'ENVIADO', label: 'Enviado para Instituição', color: 'bg-purple-100 text-purple-800', icon: Send }
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

  useEffect(() => {
    loadData();
  }, []);

  /*const loadData = async () => {
    try {
      setLoading(true);
      const investidoresRes = await investidoresService.getAll();
      setInvestidores(investidoresRes.data);
    } catch (error) {
      console.error('Erro ao carregar investidores:', error);
      alert('Erro ao carregar dados: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };*/

  const loadData = async () => {
    setLoading(true);
    setTimeout(() => {
      setInvestidores(MOCK_INVESTIDORES);
      setLoading(false);
    }, 500);
  };

  /*const loadDocumentos = async (investidorId) => {
    try {
      const documentosRes = await documentosService.getByInvestidor(investidorId);
      setDocumentos(documentosRes.data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };*/

  const loadDocumentos = async (investidorId) => {
    const docs = MOCK_DOCUMENTOS.filter(
      d => d.investidor_id === investidorId
    );
    setDocumentos(docs);
  };

  const filteredInvestidores = investidores.filter(investidor => {
    const matchesSearch =
      investidor.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investidor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investidor.passaporte_numero?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || investidor.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetalhes = (investidor) => {
    setSelectedInvestidor(investidor);
    setShowDetalhesModal(true);
  };

  const handleDocumentos = async (investidor) => {
    setSelectedInvestidor(investidor);
    await loadDocumentos(investidor.id);
    setShowDocumentosModal(true);
  };

  /* const handleDelete = async (id) => {
     if (!confirm('Tem certeza que deseja eliminar este investidor?')) return;
 
     try {
       await investidoresService.delete(id);
       await loadData();
     } catch (error) {
       alert('Erro ao eliminar investidor: ' + error.response?.data?.message);
     }
   };*/

  const handleDelete = (id) => {
    if (!confirm('Tem certeza que deseja eliminar este investidor?')) return;
    setInvestidores(prev => prev.filter(i => i.id !== id));
  };

  /*const handleUploadDocumento = async (e, investidorId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('arquivo', file);
      formData.append('investidor_id', investidorId);
      formData.append('tipo', 'OUTROS');
      formData.append('descricao', `Documento enviado: ${file.name}`);

      await documentosService.upload(formData);
      await loadDocumentos(investidorId);
      alert('Documento enviado com sucesso!');
    } catch (error) {
      alert('Erro ao enviar documento: ' + error.response?.data?.message);
    } finally {
      setUploadingDoc(false);
    }
  };*/

  const handleUploadDocumento = async (e, investidorId) => {
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
      alert('Documento enviado (mock)');
    }, 800);
  };

  /*const handleDownloadDocumento = async (documento) => {
    try {
      const response = await documentosService.download(documento.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documento.nome_arquivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Erro ao baixar documento: ' + error.response?.data?.message);
    }
  };*/

  const handleDownloadDocumento = (documento) => {
    alert(`Download mock do ficheiro: ${documento.nome_arquivo}`);
  };

  /*const handleEnviarParaInstituicao = async (investidorId) => {
    if (!confirm('Deseja enviar este investidor para as instituições? Esta ação não pode ser desfeita.')) return;

    try {
      await investidoresService.update(investidorId, {
        status: 'ENVIADO'
      });
      await loadData();
      alert('Investidor enviado para as instituições com sucesso!');
    } catch (error) {
      alert('Erro ao enviar para instituição: ' + error.response?.data?.message);
    }
  };*/

  const handleEnviarParaInstituicao = (investidorId) => {
    if (!confirm('Deseja enviar este investidor para as instituições?')) return;

    setInvestidores(prev =>
      prev.map(i =>
        i.id === investidorId
          ? { ...i, status: 'ENVIADO' }
          : i
      )
    );

    alert('Investidor enviado (mock)');
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investidores</h1>
          <p className="text-gray-600">Visualizar e enviar investidores para instituições</p>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar por nome, email ou passaporte..."
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

      {/* Tabela */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>Nacionalidade</th>
              <th>Passaporte</th>
              <th>Valor (USD)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvestidores.map((investidor) => {
              const StatusIcon = statusOptions.find(s => s.value === investidor.status)?.icon || AlertCircle;
              return (
                <tr key={investidor.id}>
                  <td className="font-medium">{investidor.nome_completo}</td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {investidor.nacionalidade}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{investidor.passaporte_numero}</span>
                  </td>
                  <td className="font-semibold">
                    {formatCurrency(investidor.valor_investimento)}
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOptions.find(s => s.value === investidor.status)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusOptions.find(s => s.value === investidor.status)?.label || investidor.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetalhes(investidor)}
                        className="text-green-600 hover:text-green-900"
                        title="Ver todas as informações"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDocumentos(investidor)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver documentos"
                        disabled={!canViewDocuments(investidor.status)}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {canSendToInstitution(investidor.status) && (
                        <button
                          onClick={() => handleEnviarParaInstituicao(investidor.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Enviar para instituições"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(investidor.id)}
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

        {filteredInvestidores.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum investidor encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus ? 'Tente alterar os filtros de pesquisa.' : 'Não existem investidores registados.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes - Visualizar todas as informações */}
      <Modal
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        title="Informações Completas do Investidor"
        size="lg"
      >
        {selectedInvestidor && (
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusOptions.find(s => s.value === selectedInvestidor.status)?.color || 'bg-gray-100 text-gray-800'
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

            {/* Botão de ação */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                {selectedInvestidor.status === 'ENVIADO' ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Este investidor já foi enviado para as instituições
                  </span>
                ) : canSendToInstitution(selectedInvestidor.status) ? (
                  <span className="text-blue-600">
                    Pronto para enviar para as instituições
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Status atual: {statusOptions.find(s => s.value === selectedInvestidor.status)?.label}
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                {canSendToInstitution(selectedInvestidor.status) && (
                  <Button
                    onClick={() => {
                      setShowDetalhesModal(false);
                      handleEnviarParaInstituicao(selectedInvestidor.id);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar para Instituições
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDetalhesModal(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Documentos - Apenas visualização para instituições */}
      <Modal
        isOpen={showDocumentosModal}
        onClose={() => setShowDocumentosModal(false)}
        title="Documentos do Investidor"
        size="lg"
      >
        {selectedInvestidor && (
          <div className="space-y-4">
            {/* Informação do status */}
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

            {/* Upload de documentos (apenas se não enviado) */}
            {selectedInvestidor.status !== 'ENVIADO' && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Enviar Documento Adicional</h3>
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
                type="button"
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