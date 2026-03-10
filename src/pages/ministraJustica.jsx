// pages/MinistraJustica.jsx
import { useState, useEffect } from 'react';
import { 
  Search, FileText, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Download, Copy, ArrowRight,
  Bell, Send, Upload, User, Calendar, Hash, FileSignature,
  MapPin, Phone, Mail, Briefcase, DollarSign, Globe
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UploadRelatorio } from '../components/UploadRelatorio';
import { SuccessModal } from '../components/modals/SuccessModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';

export const MinistraJustica = () => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showEncaminharModal, setShowEncaminharModal] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    carregarProcessos();
  }, []);

  const carregarProcessos = () => {
    setLoading(true);
    try {
      const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      
      const processosMJ = [];
      
      investidores.forEach(inv => {
        if (inv.workflow?.historico) {
          const itemMJ = inv.workflow.historico.find(
            h => h.instituicao === 'mj' && h.status === 'AGUARDANDO'
          );
          
          if (itemMJ) {
            processosMJ.push({
              id: inv.id,
              codigo: inv.codigo_identificacao,
              nome: inv.nome_completo,
              nacionalidade: inv.nacionalidade,
              passaporte: inv.passaporte_numero,
              passaporte_validade: inv.passaporte_validade,
              bi_numero: inv.bi_numero,
              data_nascimento: inv.data_nascimento,
              email: inv.email,
              telefone: inv.telefone,
              endereco: inv.endereco,
              sexo: inv.sexo,
              estado_civil: inv.estado_civil,
              tipo: inv.tipo,
              valor: inv.valor_investimento,
              data_recebimento: itemMJ.data_recebimento,
              status: itemMJ.status,
              lido: itemMJ.lido || false,
              observacoes_mp: inv.workflow.historico.find(h => h.instituicao === 'mp')?.observacoes || '',
              investidor: inv
            });
          }
        }
      });
      
      setProcessos(processosMJ);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarDocumentos = (processoId) => {
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    const investidor = investidores.find(inv => inv.id === processoId);
    
    if (investidor?.documentos) {
      setDocumentos(investidor.documentos);
    } else {
      // Documentos mock para exemplo
      setDocumentos([
        {
          id: 1,
          nome: 'Passaporte.pdf',
          tipo: 'documento',
          data: new Date().toISOString(),
          tamanho: '1.2 MB'
        },
        {
          id: 2,
          nome: 'Comprovativo de Residência.pdf',
          tipo: 'documento',
          data: new Date().toISOString(),
          tamanho: '0.8 MB'
        },
        {
          id: 3,
          nome: 'Declaração de Investimento.pdf',
          tipo: 'documento',
          data: new Date().toISOString(),
          tamanho: '2.1 MB'
        }
      ]);
    }
  };

  const handleVerDetalhes = (processo) => {
    setSelectedProcesso(processo);
    carregarDocumentos(processo.id);
    setObservacoes('');
    setRelatorio(null);
    setShowDetalhesModal(true);
    
    // Marcar como lido
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    investidores.forEach(inv => {
      if (inv.id === processo.id && inv.workflow?.historico) {
        inv.workflow.historico.forEach(item => {
          if (item.instituicao === 'mj') item.lido = true;
        });
      }
    });
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    carregarProcessos();
  };

  const handleUploadRelatorio = (relatorio) => {
    setRelatorio(relatorio);
    
    // Salvar no localStorage
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    investidores.forEach(inv => {
      if (inv.id === selectedProcesso.id) {
        if (!inv.documentos) inv.documentos = [];
        inv.documentos.push({
          id: Date.now(),
          nome: relatorio.nome,
          tipo: 'relatorio_mj',
          data: new Date().toISOString(),
          tamanho: relatorio.tamanho,
          instituicao: 'MJ'
        });
      }
    });
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    
    // Atualizar lista de documentos
    carregarDocumentos(selectedProcesso.id);
  };

  const handleConfirmarEncaminhamento = () => {
    setShowConfirmModal(true);
  };

  const handleEncaminhar = () => {
    if (!selectedProcesso) return;
    
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    
    investidores.forEach(inv => {
      if (inv.id === selectedProcesso.id && inv.workflow?.historico) {
        // Atualizar item do MJ
        const itemMJ = inv.workflow.historico.find(h => h.instituicao === 'mj');
        if (itemMJ) {
          itemMJ.status = 'REPASSADO';
          itemMJ.data_analise = new Date().toISOString();
          itemMJ.observacoes = observacoes;
          itemMJ.encaminhado_para = 'cj';
          itemMJ.relatorio_anexado = !!relatorio;
        }
        
        // Criar item para o CJ
        inv.workflow.historico.push({
          instituicao: 'cj',
          data_recebimento: new Date().toISOString(),
          data_analise: null,
          status: 'AGUARDANDO',
          observacoes: '',
          encaminhado_para: null,
          lido: false
        });
        
        inv.workflow.instituicao_atual = 'cj';
        
        // Timeline
        if (!inv.workflow.timeline) inv.workflow.timeline = [];
        inv.workflow.timeline.push({
          data: new Date().toISOString(),
          evento: 'MJ encaminhou processo para o Conselho de Ministros',
          instituicao: 'mj'
        });
      }
    });
    
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    
    setShowConfirmModal(false);
    setShowEncaminharModal(false);
    setShowDetalhesModal(false);
    carregarProcessos();
    
    setSuccessMessage('Processo encaminhado com sucesso para o Conselho de Ministros!');
  };

  const handleDownloadDocumento = (doc) => {
    setSuccessMessage(`Download iniciado: ${doc.nome}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Ministra da Justiça</h1>
          <p className="text-gray-600">Receber e encaminhar processos para o Conselho de Ministros</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar processos..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de processos */}
      {processos.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo pendente</h3>
          <p className="mt-1 text-sm text-gray-500">
            Todos os processos foram analisados ou encaminhados.
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
                  </div>
                  <Button onClick={() => handleVerDetalhes(p)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Processo
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Modal isOpen={showDetalhesModal} onClose={() => setShowDetalhesModal(false)} title="Processo - Ministra da Justiça" size="lg">
        {selectedProcesso && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            {/* Cabeçalho do Processo */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-purple-600 font-semibold">CÓDIGO DO PROCESSO</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <h2 className="text-xl font-mono font-bold text-purple-800">{selectedProcesso.codigo}</h2>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedProcesso.codigo)}
                      className="text-gray-400 hover:text-purple-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {selectedProcesso.tipo}
                </span>
              </div>
            </div>

            {/* Grid de 2 colunas para informações pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coluna 1 */}
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
                    <p className="text-xs text-gray-500">Data de Nascimento</p>
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

                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Estado Civil</p>
                    <p>{getEstadoCivilLabel(selectedProcesso.estado_civil)}</p>
                  </div>
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                  <FileSignature className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Passaporte</p>
                    <p className="font-mono">{selectedProcesso.passaporte}</p>
                    {selectedProcesso.passaporte_validade && (
                      <p className="text-xs text-gray-500">Validade: {formatDate(selectedProcesso.passaporte_validade)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                  <FileSignature className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">BI / NIF</p>
                    <p className="font-mono">{selectedProcesso.bi_numero || 'N/A'}</p>
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
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Endereço</p>
                    <p>{selectedProcesso.endereco || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de Investimento */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Informações de Investimento
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-600">Tipo</p>
                  <p className="font-medium">{selectedProcesso.tipo}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600">Valor</p>
                  <p className="font-medium text-lg">
                    ${selectedProcesso.valor?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Observações do MP */}
            {selectedProcesso.observacoes_mp && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-600 font-medium">Observações do Ministério Público</p>
                <p className="text-sm mt-1">{selectedProcesso.observacoes_mp}</p>
              </div>
            )}

            {/* Documentos do Processo */}
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Documentos do Processo
              </h4>
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium">{doc.nome}</p>
                        <p className="text-xs text-gray-500">
                          {doc.tipo} • {formatDate(doc.data)} • {doc.tamanho}
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
            </div>

            {/* Upload de Relatório */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Anexar Relatório / Parecer</h4>
              <UploadRelatorio
                onUpload={handleUploadRelatorio}
                instituicao="MJ"
                processoId={selectedProcesso.id}
                tipo="RELATORIO_MJ"
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
              <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
              <textarea
                className="input w-full"
                rows="3"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações antes de encaminhar..."
              />
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowDetalhesModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowEncaminharModal(true)}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Encaminhar para Conselho de Ministros
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Encaminhamento */}
      <Modal isOpen={showEncaminharModal} onClose={() => setShowEncaminharModal(false)} title="Confirmar Encaminhamento">
        <div className="space-y-4">
          <p>Tem certeza que deseja encaminhar este processo para o Conselho de Ministros?</p>
          
          {relatorio && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Relatório anexado: {relatorio.nome}
              </p>
            </div>
          )}

          {observacoes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Observações:</p>
              <p className="text-sm">{observacoes}</p>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <ArrowRight className="w-4 h-4 inline mr-1" />
              Após confirmação, o processo será encaminhado para o Conselho de Ministros.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEncaminharModal(false)}>
              Voltar
            </Button>
            <Button onClick={handleConfirmarEncaminhamento}>
              <Send className="w-4 h-4 mr-2" />
              Confirmar Encaminhamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação Final */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleEncaminhar}
        title="Confirmar Encaminhamento"
        message="Esta ação não pode ser desfeita. Deseja realmente encaminhar o processo?"
        confirmText="Sim, Encaminhar"
        cancelText="Cancelar"
      />

      {/* Modal de Sucesso */}
      <SuccessModal
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
};