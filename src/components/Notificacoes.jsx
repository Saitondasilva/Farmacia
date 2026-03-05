// components/CentralNotificacoes.jsx
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock, AlertCircle, Send, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { INSTITUICOES, STATUS_FLUXO } from '../utils/constants';

export const CentralNotificacoes = ({ instituicaoAtual }) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [showModalAnalise, setShowModalAnalise] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [instituicaoDestino, setInstituicaoDestino] = useState('');
  const [loading, setLoading] = useState(false);

  // Carregar processos para esta instituição
  useEffect(() => {
    carregarProcessos();
    
    // Verificar expiração a cada hora
    const interval = setInterval(verificarExpiracao, 3600000);
    return () => clearInterval(interval);
  }, [instituicaoAtual]);

  const carregarProcessos = () => {
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    
    const processos = [];
    
    investidores.forEach(inv => {
      if (inv.workflow?.historico) {
        // Encontrar o item no histórico que corresponde à instituição atual
        const itemAtual = inv.workflow.historico.find(
          h => h.instituicao === instituicaoAtual && h.status === 'AGUARDANDO'
        );
        
        if (itemAtual) {
          processos.push({
            id: `${inv.id}-${itemAtual.data_recebimento}`,
            investidor: inv,
            workflow_item: itemAtual,
            data_recebimento: itemAtual.data_recebimento,
            status: itemAtual.status,
            lido: itemAtual.lido || false
          });
        }
      }
    });
    
    // Ordenar por data (mais recentes primeiro)
    processos.sort((a, b) => new Date(b.data_recebimento) - new Date(a.data_recebimento));
    setNotificacoes(processos);
  };

  const verificarExpiracao = () => {
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    let modificado = false;
    
    investidores.forEach(inv => {
      if (inv.workflow?.historico) {
        inv.workflow.historico.forEach(item => {
          const dataExpiracao = new Date(item.data_recebimento);
          dataExpiracao.setDate(dataExpiracao.getDate() + DIAS_EXPIRACAO);
          
          if (item.status === 'AGUARDANDO' && new Date() > dataExpiracao) {
            item.status = 'EXPIRADO';
            modificado = true;
          }
        });
      }
    });
    
    if (modificado) {
      localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
      carregarProcessos();
    }
  };

  const handleAnalisar = (processo) => {
    setSelectedProcesso(processo);
    setObservacoes(processo.workflow_item.observacoes || '');
    
    // Definir próxima instituição baseada na ordem
    const ordemAtual = Object.values(INSTITUICOES).find(i => i.id === instituicaoAtual)?.ordem || 0;
    const proximaInst = Object.values(INSTITUICOES).find(i => i.ordem === ordemAtual + 1);
    setInstituicaoDestino(proximaInst?.id || '');
    
    setShowModalAnalise(true);
    marcarComoLido(processo.id);
  };

  const marcarComoLido = (processoId) => {
    const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
    
    investidores.forEach(inv => {
      if (inv.workflow?.historico) {
        inv.workflow.historico.forEach(item => {
          if (item.instituicao === instituicaoAtual && item.status === 'AGUARDANDO') {
            item.lido = true;
          }
        });
      }
    });
    
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
    carregarProcessos();
  };

  const handleDecisao = (aprovado) => {
    if (!selectedProcesso) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const investidores = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      
      investidores.forEach(inv => {
        if (inv.id === selectedProcesso.investidor.id) {
          // Atualizar item atual no histórico
          const itemAtual = inv.workflow.historico.find(
            h => h.instituicao === instituicaoAtual && h.data_recebimento === selectedProcesso.data_recebimento
          );
          
          if (itemAtual) {
            itemAtual.status = aprovado ? 'APROVADO' : 'RECUSADO';
            itemAtual.data_analise = new Date().toISOString();
            itemAtual.observacoes = observacoes;
            
            if (aprovado && instituicaoDestino) {
              itemAtual.encaminhado_para = instituicaoDestino;
              
              // Criar novo item para próxima instituição
              inv.workflow.historico.push({
                instituicao: instituicaoDestino,
                data_recebimento: new Date().toISOString(),
                data_analise: null,
                status: 'AGUARDANDO',
                observacoes: '',
                encaminhado_para: null,
                anexos: [],
                usuario: null,
                lido: false
              });
              
              inv.workflow.instituicao_atual = instituicaoDestino;
              
              // Adicionar à timeline
              inv.workflow.timeline.push({
                data: new Date().toISOString(),
                evento: `${INSTITUICOES[instituicaoAtual.toUpperCase()].nome} aprovou e encaminhou para ${INSTITUICOES[instituicaoDestino.toUpperCase()].nome}`,
                instituicao: instituicaoAtual
              });
              
              inv.workflow.timeline.push({
                data: new Date().toISOString(),
                evento: `Recebido pelo ${INSTITUICOES[instituicaoDestino.toUpperCase()].nome}`,
                instituicao: instituicaoDestino
              });
            } else if (!aprovado) {
              inv.workflow.status_global = 'recusado';
              inv.workflow.timeline.push({
                data: new Date().toISOString(),
                evento: `${INSTITUICOES[instituicaoAtual.toUpperCase()].nome} recusou o processo`,
                instituicao: instituicaoAtual
              });
            }
          }
        }
      });
      
      localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(investidores));
      carregarProcessos();
      
      setShowModalAnalise(false);
      setSelectedProcesso(null);
      setLoading(false);
      
      if (!aprovado) {
        alert('Processo recusado com sucesso!');
      } else if (!instituicaoDestino) {
        alert('Processo aprovado e concluído!');
      } else {
        alert(`Processo aprovado e encaminhado para ${INSTITUICOES[instituicaoDestino.toUpperCase()].nome}!`);
      }
    }, 800);
  };

  const naoLidas = notificacoes.filter(n => !n.lido).length;

  return (
    <>
      {/* Ícone de notificação */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <Bell className="w-6 h-6" />
          {naoLidas > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {naoLidas}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
            <div className="p-3 border-b bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold text-gray-700">
                {INSTITUICOES[instituicaoAtual.toUpperCase()]?.nome} - Notificações
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma notificação pendente
                </div>
              ) : (
                notificacoes.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.lido ? 'bg-blue-50' : ''}`}
                    onClick={() => handleAnalisar(notif)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm">{notif.investidor.nome_completo}</p>
                          <span className="text-xs text-gray-500">
                            {format(parseISO(notif.data_recebimento), 'dd/MM')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Código: {notif.investidor.codigo_identificacao}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            Aguardando análise
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Análise */}
      <Modal
        isOpen={showModalAnalise}
        onClose={() => setShowModalAnalise(false)}
        title={`Análise - ${INSTITUICOES[instituicaoAtual.toUpperCase()]?.nome}`}
        size="lg"
      >
        {selectedProcesso && (
          <div className="space-y-4">
            {/* Timeline do processo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Linha do Tempo</h4>
              <div className="space-y-2">
                {selectedProcesso.investidor.workflow.timeline.slice(-3).map((evento, idx) => (
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

            {/* Informações do Investidor */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Dados do Processo</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nome:</span>
                  <p className="font-medium">{selectedProcesso.investidor.nome_completo}</p>
                </div>
                <div>
                  <span className="text-gray-500">Código:</span>
                  <p className="font-mono">{selectedProcesso.investidor.codigo_identificacao}</p>
                </div>
                <div>
                  <span className="text-gray-500">Passaporte:</span>
                  <p>{selectedProcesso.investidor.passaporte_numero}</p>
                </div>
                <div>
                  <span className="text-gray-500">Valor:</span>
                  <p className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' })
                      .format(selectedProcesso.investidor.valor_investimento)}
                  </p>
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div>
              <h4 className="font-medium mb-2">Documentos</h4>
              <div className="space-y-2">
                {selectedProcesso.investidor.anexos?.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{doc.nome}</span>
                    <Button size="sm" variant="secondary">Visualizar</Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="input w-full"
                rows="3"
                placeholder="Adicione observações sobre sua decisão..."
                disabled={loading}
              />
            </div>

            {/* Próxima instituição (se aplicável) */}
            {instituicaoDestino && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-blue-700">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Após aprovação, será encaminhado para: <strong>{INSTITUICOES[instituicaoDestino.toUpperCase()]?.nome}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowModalAnalise(false)}
                disabled={loading}
              >
                Voltar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDecisao(false)}
                disabled={loading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Recusar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDecisao(true)}
                disabled={loading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {instituicaoDestino ? 'Aprovar e Encaminhar' : 'Concluir Processo'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};