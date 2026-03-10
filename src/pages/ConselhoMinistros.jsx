// pages/ConselhoJustica.jsx
import { useState, useEffect } from 'react';
import { 
  Search, FileText, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Download, Upload, FileCheck,
  Bell, ArrowRight, User, Calendar, Hash, Globe,
  Briefcase, DollarSign, FileSignature, Mail, Phone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SuccessModal } from '../components/modals/SuccessModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ConselhoMinistro = () => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [showAnaliseModal, setShowAnaliseModal] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentosDisponiveis, setDocumentosDisponiveis] = useState([]);
  const [showDocumentosModal, setShowDocumentosModal] = useState(false);

  useEffect(() => {
    carregarProcessos();
  }, []);

  const carregarProcessos = () => {
    setLoading(true);
    try {
      const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      
      const processosCM = [];
      
      investidores.forEach(inv => {
        if (inv.workflow?.historico) {
          const itemCM = inv.workflow.historico.find(
            h => h.instituicao === 'cj' && h.status === 'AGUARDANDO'
          );
          
          if (itemCM) {
            processosCM.push({
              id: inv.id,
              codigo: inv.codigo_identificacao,
              nome: inv.nome_completo,
              nacionalidade: inv.nacionalidade,
              passaporte: inv.passaporte_numero,
              data_nascimento: inv.data_nascimento,
              email: inv.email,
              telefone: inv.telefone,
              endereco: inv.endereco,
              tipo: inv.tipo,
              data_recebimento: itemCM.data_recebimento,
              status: itemCM.status,
              lido: itemCM.lido || false,
              relatorio_anexado: itemCM.relatorio_anexado || false,
              investidor: inv,
              documentos: inv.documentos || []
            });
          }
        }
      });
      
      setProcessos(processosCM);
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
    
    if (processo.investidor?.documentos) {
      processo.investidor.documentos.forEach(doc => {
        docs.push({
          id: doc.id,
          nome: doc.nome,
          tipo: doc.tipo === 'RELATORIO_CJ' ? 'Relatório CJ' : 'Documento',
          data: doc.data,
          icon: FileText
        });
      });
    }
    
    setDocumentosDisponiveis(docs);
  };

  const handleAnalisar = (processo) => {
    setSelectedProcesso(processo);
    carregarDocumentosProcesso(processo);
    setObservacoes('');
    setRelatorio(null);
    setUploadProgress(0);
    setShowAnaliseModal(true);
    
    // Marcar como lido
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    investidores.forEach(inv => {
      if (inv.id === processo.id && inv.workflow?.historico) {
        inv.workflow.historico.forEach(item => {
          if (item.instituicao === 'cj') item.lido = true;
        });
      }
    });
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    carregarProcessos();
  };

  const handleUploadRelatorio = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simular progresso de upload
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      
      setRelatorio(file);
    }
  };

  const handleConfirmarAnalise = () => {
    setShowConfirmModal(true);
  };

  const handleConcluirAnalise = () => {
    if (!selectedProcesso || !relatorio) {
      alert('Por favor, anexe o relatório antes de concluir.');
      return;
    }

    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    
    investidores.forEach(inv => {
      if (inv.id === selectedProcesso.id && inv.workflow?.historico) {
        // Atualizar item do CJ
        const itemCM = inv.workflow.historico.find(h => h.instituicao === 'cj');
        if (itemCM) {
          itemCM.status = 'APROVADO';
          itemCM.data_analise = new Date().toISOString();
          itemCM.observacoes = observacoes;
          itemCM.relatorio_anexado = true;
          itemCM.relatorio_nome = relatorio.name;
          itemCM.encaminhado_para = 'pr';
        }
        
        // Adicionar relatório aos documentos
        if (!inv.documentos) inv.documentos = [];
        inv.documentos.push({
          id: Date.now(),
          nome: relatorio.name,
          tipo: 'RELATORIO_CJ',
          data: new Date().toISOString(),
          investidor_id: inv.id,
          tamanho: relatorio.size
        });
        
        // Criar item para o PR
        inv.workflow.historico.push({
          instituicao: 'pr',
          data_recebimento: new Date().toISOString(),
          data_analise: null,
          status: 'AGUARDANDO',
          observacoes: '',
          encaminhado_para: null,
          lido: false
        });
        
        inv.workflow.instituicao_atual = 'pr';
        
        // Timeline
        if (!inv.workflow.timeline) inv.workflow.timeline = [];
        inv.workflow.timeline.push({
          data: new Date().toISOString(),
          evento: 'CM analisou processo e anexou relatório',
          instituicao: 'cm'
        });
        
        inv.workflow.timeline.push({
          data: new Date().toISOString(),
          evento: 'Processo encaminhado para Presidência da República',
          instituicao: 'cm'
        });
      }
    });
    
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    
    setShowConfirmModal(false);
    setShowAnaliseModal(false);
    setRelatorio(null);
    setUploadProgress(0);
    carregarProcessos();
    
    setSuccessMessage('Processo analisado e encaminhado para a Presidência da República com sucesso!');
  };

  const handleVisualizarDocumento = (documento) => {
    // Simular visualização
    window.open(`#`, '_blank');
  };

  const handleDownloadDocumento = (documento) => {
    // Simular download
    alert(`Download do documento: ${documento.nome}`);
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    try {
      return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return data;
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-10" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conselho de Ministros</h1>
          <p className="text-gray-600">Análise de processos e elaboração de relatórios</p>
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
          <FileCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo para análise</h3>
          <p className="mt-1 text-sm text-gray-500">
            Todos os processos foram analisados ou encaminhados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {processos
            .filter(p => 
              p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
              p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.passaporte.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(p => (
              <div key={p.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {p.codigo}
                      </span>
                      {!p.lido && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Novo
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Recebido: {formatarData(p.data_recebimento)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-lg">{p.nome}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Nacionalidade</p>
                        <p className="text-sm">{p.nacionalidade}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Passaporte</p>
                        <p className="text-sm font-mono">{p.passaporte}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tipo</p>
                        <p className="text-sm">{p.tipo}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => handleAnalisar(p)}>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Analisar
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal de Análise */}
      <Modal isOpen={showAnaliseModal} onClose={() => setShowAnaliseModal(false)} title="Análise de Processo" size="lg">
        {selectedProcesso && (
          <div className="space-y-6">
            {/* Detalhes completos do processo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Detalhes do Processo
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Código</p>
                    <p className="font-mono text-sm">{selectedProcesso.codigo}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Nome Completo</p>
                    <p className="text-sm">{selectedProcesso.nome}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Nacionalidade</p>
                    <p className="text-sm">{selectedProcesso.nacionalidade}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <FileSignature className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Passaporte</p>
                    <p className="text-sm font-mono">{selectedProcesso.passaporte}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Data de Nascimento</p>
                    <p className="text-sm">{formatarData(selectedProcesso.data_nascimento)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Tipo de Processo</p>
                    <p className="text-sm">{selectedProcesso.tipo}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm">{selectedProcesso.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Telefone</p>
                    <p className="text-sm">{selectedProcesso.telefone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentos disponíveis */}
            <div>
              <h4 className="font-medium mb-3">Documentos Disponíveis</h4>
              <div className="space-y-2">
                {documentosDisponiveis.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium">{doc.nome}</p>
                        <p className="text-xs text-gray-500">
                          {doc.tipo} • {formatarData(doc.data)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleVisualizarDocumento(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleDownloadDocumento(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload de Relatório */}
            <div>
              <h4 className="font-medium mb-3">Anexar Relatório de Análise *</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="relatorio-upload"
                  onChange={handleUploadRelatorio}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <label 
                  htmlFor="relatorio-upload"
                  className="cursor-pointer block text-center"
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar o relatório
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX (máx. 10MB)
                  </p>
                </label>
              </div>

              {relatorio && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{relatorio.name}</p>
                        <p className="text-xs text-green-600">
                          {(relatorio.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    {uploadProgress < 100 && uploadProgress > 0 && (
                      <span className="text-sm text-green-600">{uploadProgress}%</span>
                    )}
                  </div>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Observações / Parecer
              </label>
              <textarea
                className="input w-full"
                rows="4"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva a análise, conclusões e recomendações..."
              />
            </div>

            {/* Informação de encaminhamento */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <ArrowRight className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Próxima etapa: Presidência da República
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Após concluir a análise e anexar o relatório, o processo será automaticamente encaminhado para promulgação.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="secondary" 
                onClick={() => setShowAnaliseModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmarAnalise}
                disabled={!relatorio}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Concluir Análise
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConcluirAnalise}
        title="Confirmar Análise"
        message="Tem certeza que deseja concluir a análise e encaminhar o processo para a Presidência da República?"
        confirmText="Sim, Concluir"
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