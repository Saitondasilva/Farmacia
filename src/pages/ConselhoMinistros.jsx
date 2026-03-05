// pages/ConselhoJustica.jsx
import { useState, useEffect } from 'react';
import { 
  Search, FileText, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Download, Upload, FileCheck,
  Bell, ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
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
              valor: inv.valor_investimento,
              tipo: inv.tipo,
              data_recebimento: itemCM.data_recebimento,
              status: itemCM.status,
              lido: itemCM.lido || false,
              relatorio_anexado: itemCM.relatorio_anexado || false,
              investidor: inv
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

  const handleAnalisar = (processo) => {
    setSelectedProcesso(processo);
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
      setRelatorio(file);
    }
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
          investidor_id: inv.id
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
        inv.workflow.timeline.push({
          data: new Date().toISOString(),
          evento: 'CJ analisou processo e anexou relatório',
          instituicao: 'cj'
        });
        
        inv.workflow.timeline.push({
          data: new Date().toISOString(),
          evento: 'Processo encaminhado para Presidência da República',
          instituicao: 'cj'
        });
      }
    });
    
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    
    setShowAnaliseModal(false);
    setRelatorio(null);
    carregarProcessos();
    alert('Processo analisado e encaminhado para a Presidência!');
  };

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-10" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conselho da Justiça</h1>
          <p className="text-gray-600">Análise de processos e elaboração de relatórios</p>
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

      {/* Lista */}
      {processos.length === 0 ? (
        <div className="text-center py-12">
          <FileCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo para análise</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {processos
            .filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(p => (
              <div key={p.id} className="border rounded-lg p-4 bg-white shadow-sm">
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
                    <p className="text-sm font-semibold mt-1">${p.valor?.toLocaleString()}</p>
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
      <Modal isOpen={showAnaliseModal} onClose={() => setShowAnaliseModal(false)} title="Análise de Processo - CJ" size="lg">
        {selectedProcesso && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Processo: {selectedProcesso.codigo}</h4>
              <p><span className="text-gray-500">Nome:</span> {selectedProcesso.nome}</p>
              <p><span className="text-gray-500">Valor:</span> ${selectedProcesso.valor?.toLocaleString()}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Documentos disponíveis</h4>
              <div className="border rounded p-2 flex justify-between items-center">
                <span>Processo completo</span>
                <Button size="sm" variant="secondary">Visualizar</Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Anexar Relatório de Análise *</h4>
              <input
                type="file"
                onChange={handleUploadRelatorio}
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {relatorio && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {relatorio.name} selecionado
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observações / Conclusão</label>
              <textarea
                className="input w-full"
                rows="3"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva a análise e conclusão..."
              />
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-700">
                Após conclusão, o processo será encaminhado para a Presidência da República.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowAnaliseModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConcluirAnalise} disabled={!relatorio}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Concluir e Encaminhar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};