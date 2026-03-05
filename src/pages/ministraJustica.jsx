// pages/MinistraJustica.jsx
import { useState, useEffect } from 'react';
import { 
  Search, FileText, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Download, Copy, ArrowRight,
  Bell, Send
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const MinistraJustica = () => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showEncaminharModal, setShowEncaminharModal] = useState(false);
  const [observacoes, setObservacoes] = useState('');

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
              valor: inv.valor_investimento,
              tipo: inv.tipo,
              data_recebimento: itemMJ.data_recebimento,
              status: itemMJ.status,
              lido: itemMJ.lido || false,
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

  const handleVerDetalhes = (processo) => {
    setSelectedProcesso(processo);
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
        inv.workflow.timeline.push({
          data: new Date().toISOString(),
          evento: 'MJ encaminhou processo para o Conselho de Ministros',
          instituicao: 'mj'
        });
      }
    });
    
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    
    setShowEncaminharModal(false);
    setShowDetalhesModal(false);
    carregarProcessos();
    alert('Processo encaminhado para o Conselho de Ministros!');
  };

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-10" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ministério da Justiça</h1>
          <p className="text-gray-600">Receber e encaminhar processos para o CJ</p>
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
      <Modal isOpen={showDetalhesModal} onClose={() => setShowDetalhesModal(false)} title="Processo - MJ" size="lg">
        {selectedProcesso && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Informações do Processo</h4>
              <p><span className="text-gray-500">Código:</span> {selectedProcesso.codigo}</p>
              <p><span className="text-gray-500">Nome:</span> {selectedProcesso.nome}</p>
              <p><span className="text-gray-500">Passaporte:</span> {selectedProcesso.passaporte}</p>
              <p><span className="text-gray-500">Valor:</span> ${selectedProcesso.valor?.toLocaleString()}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Documentos</h4>
              <div className="border rounded p-2 flex justify-between items-center">
                <span>Processo completo</span>
                <Button size="sm" variant="secondary">Visualizar</Button>
              </div>
            </div>

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

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDetalhesModal(false)}>Voltar</Button>
              <Button onClick={() => setShowEncaminharModal(true)}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Encaminhar para CJ
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação */}
      <Modal isOpen={showEncaminharModal} onClose={() => setShowEncaminharModal(false)} title="Confirmar Encaminhamento">
        <p>Tem certeza que deseja encaminhar este processo para o Conselho de Ministros?</p>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowEncaminharModal(false)}>Cancelar</Button>
          <Button onClick={handleEncaminhar}>Confirmar</Button>
        </div>
      </Modal>
    </div>
  );
};