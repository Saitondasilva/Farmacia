// pages/PresidenciaRepublica.jsx
import { useState, useEffect } from 'react';
import { 
  Search, FileText, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Download, Upload, Award,
  Bell, ArrowRight, FileCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const PresidenciaRepublica = () => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [showPromulgacaoModal, setShowPromulgacaoModal] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [observacoes, setObservacoes] = useState('');

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
              valor: inv.valor_investimento,
              tipo: inv.tipo,
              data_recebimento: itemPR.data_recebimento,
              status: itemPR.status,
              lido: itemPR.lido || false,
              relatorio_cj: inv.documentos?.find(d => d.tipo === 'RELATORIO_CJ'),
              investidor: inv
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

  const handlePromulgar = (processo) => {
    setSelectedProcesso(processo);
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

  const handleUploadRelatorio = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRelatorio(file);
    }
  };

  const handleConcluirPromulgacao = () => {
    if (!selectedProcesso || !relatorio) {
      alert('Por favor, anexe o relatório de promulgação.');
      return;
    }

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
          investidor_id: inv.id
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
    
    setShowPromulgacaoModal(false);
    setRelatorio(null);
    carregarProcessos();
    alert('Processo promulgado e enviado de volta ao UCID!');
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
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo para promulgação</h3>
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
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Processo: {selectedProcesso.codigo}</h4>
              <p><span className="text-gray-500">Nome:</span> {selectedProcesso.nome}</p>
              <p><span className="text-gray-500">Valor:</span> ${selectedProcesso.valor?.toLocaleString()}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Documentos disponíveis</h4>
              <div className="border rounded p-2 flex justify-between items-center">
                <span>Relatório do Conselho da Justiça</span>
                <Button size="sm" variant="secondary">Visualizar</Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Anexar Relatório de Promulgação *</h4>
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
              <label className="block text-sm font-medium mb-2">Observações / Promulgação</label>
              <textarea
                className="input w-full"
                rows="3"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Registe observações sobre a promulgação..."
              />
            </div>

            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-green-700">
                Após promulgação, o processo retornará ao UCID para impressão.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowPromulgacaoModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConcluirPromulgacao} disabled={!relatorio}>
                <Award className="w-4 h-4 mr-2" />
                Promulgar e Finalizar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};