// pages/Repografia.jsx
import { useState, useEffect } from 'react';
import { 
  Search, FileText, Eye, CheckCircle, 
  Clock, AlertCircle, Download, Printer,
  Bell, FileCheck, Archive
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Repografia = () => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [showImpressaoModal, setShowImpressaoModal] = useState(false);
  const [registro, setRegistro] = useState('');

  useEffect(() => {
    carregarProcessos();
  }, []);

  const carregarProcessos = () => {
    setLoading(true);
    try {
      const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      
      const processosReprografia = [];
      
      investidores.forEach(inv => {
        if (inv.workflow?.historico) {
          const itemUCID = inv.workflow.historico.find(
            h => h.instituicao === 'ucid' && 
                 h.status === 'AGUARDANDO' && 
                 h.observacoes?.includes('impressão')
          );
          
          if (itemUCID) {
            processosReprografia.push({
              id: inv.id,
              codigo: inv.codigo_identificacao,
              nome: inv.nome_completo,
              nacionalidade: inv.nacionalidade,
              passaporte: inv.passaporte_numero,
              valor: inv.valor_investimento,
              tipo: inv.tipo,
              data_recebimento: itemUCID.data_recebimento,
              status: 'AGUARDANDO_IMPRESSAO',
              lido: itemUCID.lido || false,
              relatorio_cj: inv.documentos?.find(d => d.tipo === 'RELATORIO_CJ'),
              relatorio_pr: inv.documentos?.find(d => d.tipo === 'RELATORIO_PROMULGACAO'),
              investidor: inv
            });
          }
        }
      });
      
      setProcessos(processosReprografia);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = (processo) => {
    setSelectedProcesso(processo);
    setRegistro('');
    setShowImpressaoModal(true);
    
    // Marcar como lido
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    investidores.forEach(inv => {
      if (inv.id === processo.id && inv.workflow?.historico) {
        inv.workflow.historico.forEach(item => {
          if (item.instituicao === 'ucid' && item.observacoes?.includes('impressão')) {
            item.lido = true;
          }
        });
      }
    });
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    carregarProcessos();
  };

  const handleConfirmarImpressao = () => {
    if (!selectedProcesso || !registro) {
      alert('Por favor, registre o número de registro.');
      return;
    }

    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    
    investidores.forEach(inv => {
      if (inv.id === selectedProcesso.id && inv.workflow?.historico) {
        // Atualizar item do UCID
        const itemUCID = inv.workflow.historico.find(
          h => h.instituicao === 'ucid' && h.observacoes?.includes('impressão')
        );
        if (itemUCID) {
          itemUCID.status = 'CONCLUIDO';
          itemUCID.data_analise = new Date().toISOString();
          itemUCID.observacoes = `Processo impresso - Registro: ${registro}`;
        }
        
        inv.workflow.status_global = 'concluido';
        inv.status = 'CONCLUIDO';
        inv.registro_impressao = registro;
        
        // Timeline
        inv.workflow.timeline.push({
          data: new Date().toISOString(),
          evento: `Processo impresso e registrado (Nº ${registro})`,
          instituicao: 'repografia'
        });
      }
    });
    
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    
    setShowImpressaoModal(false);
    carregarProcessos();
    alert(`Processo impresso e registrado com sucesso! Nº Registro: ${registro}`);
  };

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-10" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repografia</h1>
          <p className="text-gray-600">Impressão e registro final de processos</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar processos para impressão..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      {processos.length === 0 ? (
        <div className="text-center py-12">
          <Printer className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo para impressão</h3>
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
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-green-600 flex items-center">
                        <FileCheck className="w-3 h-3 mr-1" />
                        Relatório CJ
                      </span>
                      <span className="text-xs text-green-600 flex items-center">
                        <FileCheck className="w-3 h-3 mr-1" />
                        Relatório PR
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => handleImprimir(p)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal de Impressão */}
      <Modal isOpen={showImpressaoModal} onClose={() => setShowImpressaoModal(false)} title="Impressão e Registro" size="lg">
        {selectedProcesso && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Processo: {selectedProcesso.codigo}</h4>
              <p><span className="text-gray-500">Nome:</span> {selectedProcesso.nome}</p>
              <p><span className="text-gray-500">Valor:</span> ${selectedProcesso.valor?.toLocaleString()}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Documentos para impressão</h4>
              <div className="space-y-2">
                <div className="border rounded p-2 flex justify-between items-center">
                  <span>Processo completo</span>
                  <Button size="sm" variant="secondary">Visualizar</Button>
                </div>
                <div className="border rounded p-2 flex justify-between items-center">
                  <span>Relatório do Conselho da Justiça</span>
                  <Button size="sm" variant="secondary">Visualizar</Button>
                </div>
                <div className="border rounded p-2 flex justify-between items-center">
                  <span>Relatório da Presidência</span>
                  <Button size="sm" variant="secondary">Visualizar</Button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Número de Registro / Protocolo *
              </label>
              <input
                type="text"
                className="input w-full"
                value={registro}
                onChange={(e) => setRegistro(e.target.value)}
                placeholder="Ex: REG-2025-0001"
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-sm text-yellow-700">
                Ao confirmar, o processo será marcado como concluído e os documentos serão enviados para impressão.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowImpressaoModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmarImpressao} disabled={!registro}>
                <Archive className="w-4 h-4 mr-2" />
                Confirmar Impressão e Registro
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};