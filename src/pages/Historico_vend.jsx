// pages/HistoricoVenda.jsx - Versão simplificada para histórico de vendas
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Printer, Search, Calendar, 
  FileText, User, Eye, Filter, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { vendasService } from '../services/vendasService';
import { clientesService } from '../services/clientesService';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const HistoricoVenda = ({ onBack }) => {
  const { user } = useAuth();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [vendas, setVendas] = useState([]);
  const [vendasFiltradas, setVendasFiltradas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [showDetalheModal, setShowDetalheModal] = useState(false);
  
  // Filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // FUNÇÃO AUXILIAR PARA FORMATAR PREÇO
  const formatarPreco = (valor) => {
    const numero = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : Number(valor);
    return isNaN(numero) ? 0 : numero;
  };

  // FUNÇÃO AUXILIAR PARA EXIBIR PREÇO FORMATADO
  const exibirPreco = (valor) => {
    return formatarPreco(valor).toFixed(2);
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarVendas();
    carregarClientes();
  }, []);

  const carregarVendas = async () => {
    try {
      setLoading(true);
      const res = await vendasService.getAll();
      console.log('📦 Vendas carregadas:', res?.length);
      setVendas(res || []);
      setVendasFiltradas(res || []);
    } catch (error) {
      console.error('❌ Erro ao carregar vendas:', error);
      toast.error('Erro ao carregar histórico de vendas: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const carregarClientes = async () => {
    try {
      const res = await clientesService.getAll();
      setClientes(res || []);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    let filtradas = [...vendas];

    // Filtro por período
    if (filtroDataInicio) {
      filtradas = filtradas.filter(v => 
        new Date(v.data_venda || v.data) >= new Date(filtroDataInicio)
      );
    }
    if (filtroDataFim) {
      filtradas = filtradas.filter(v => 
        new Date(v.data_venda || v.data) <= new Date(filtroDataFim)
      );
    }

    // Filtro por cliente
    if (filtroCliente) {
      filtradas = filtradas.filter(v => 
        v.cliente_id === parseInt(filtroCliente) ||
        v.cliente_nome?.toLowerCase().includes(filtroCliente.toLowerCase())
      );
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      filtradas = filtradas.filter(v => v.status === filtroStatus);
    }

    // Filtro por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtradas = filtradas.filter(v => 
        v.id?.toString().includes(search) ||
        v.cliente_nome?.toLowerCase().includes(search) ||
        v.utilizador_nome?.toLowerCase().includes(search) ||
        v.nif_cliente?.includes(search) ||
        v.forma_pagamento?.toLowerCase().includes(search)
      );
    }

    setVendasFiltradas(filtradas);
  };

  // Aplicar filtros quando os critérios mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtroDataInicio, filtroDataFim, filtroCliente, filtroStatus, searchTerm, vendas]);

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroCliente('');
    setFiltroStatus('todos');
    setSearchTerm('');
    setVendasFiltradas(vendas);
  };

  // Ver detalhes da venda
  const verDetalhes = async (venda) => {
    try {
      setLoading(true);
      const vendaCompleta = await vendasService.getById(venda.id);
      setVendaSelecionada(vendaCompleta);
      setShowDetalheModal(true);
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes da venda:', error);
      toast.error('Erro ao carregar detalhes da venda');
    } finally {
      setLoading(false);
    }
  };

  // Imprimir recibo
  const imprimirRecibo = (venda) => {
    const reciboWindow = window.open('', '_blank', 'width=400,height=600');
    if (!reciboWindow) {
      toast.error('Permita pop-ups para imprimir o recibo');
      return;
    }
    
    const itens = venda.itens || [];
    const vendaData = venda.data_venda ? new Date(venda.data_venda).toLocaleString() : new Date().toLocaleString();
    
    reciboWindow.document.write(`
      <html>
        <head>
          <title>Recibo - Venda #${venda.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 350px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 18px; }
            .header p { margin: 5px 0; font-size: 12px; color: #666; }
            .cliente { margin-bottom: 15px; font-size: 12px; }
            .cliente p { margin: 3px 0; }
            table { width: 100%; font-size: 12px; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px dashed #ccc; padding: 5px 0; }
            td { padding: 5px 0; border-bottom: 1px dotted #eee; }
            .text-right { text-align: right; }
            .totais { margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; }
            .totais p { margin: 3px 0; font-size: 14px; }
            .total-final { font-size: 18px; font-weight: bold; color: #1a56db; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #666; border-top: 1px dashed #ccc; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🏥 Farmácia Central</h2>
            <p>NIF: 123456789</p>
            <p>Rua Principal, 123 - Centro</p>
            <p>Tel: (11) 9999-9999</p>
            <p><strong>Venda #${venda.id}</strong></p>
            <p>${vendaData}</p>
          </div>
          
          <div class="cliente">
            <p><strong>Cliente:</strong> ${venda.cliente_nome || 'Consumidor Final'}</p>
            <p><strong>NIF:</strong> ${venda.nif_cliente || '---'}</p>
            <p><strong>Vendedor:</strong> ${venda.utilizador_nome || '---'}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th class="text-right">Qtd</th>
                <th class="text-right">Preço</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itens.map(item => `
                <tr>
                  <td>${item.medicamento_nome || item.nome || '---'}</td>
                  <td class="text-right">${item.quantidade}</td>
                  <td class="text-right">${exibirPreco(item.preco_unitario)}</td>
                  <td class="text-right">${exibirPreco(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totais">
            <p>Subtotal: <span class="text-right">${exibirPreco(venda.total || 0)}€</span></p>
            ${venda.desconto > 0 ? `<p>Desconto (${venda.desconto}%): <span class="text-right">-${exibirPreco(venda.total * venda.desconto / 100)}€</span></p>` : ''}
            <p class="total-final">TOTAL: ${exibirPreco(venda.total || 0)}€</p>
            <p>Forma Pagamento: ${venda.forma_pagamento}</p>
            <p>Status: ${venda.status}</p>
          </div>
          
          <div class="footer">
            <p>Obrigado pela preferência!</p>
            <p>Volte sempre 🏥</p>
          </div>
        </body>
      </html>
    `);
    reciboWindow.document.close();
    reciboWindow.print();
  };

  // Exportar dados (CSV)
  const exportarCSV = () => {
    if (vendasFiltradas.length === 0) {
      toast.warning('Não há dados para exportar');
      return;
    }

    const headers = ['ID', 'Data', 'Cliente', 'NIF', 'Total', 'Desconto', 'Forma Pagamento', 'Status', 'Vendedor'];
    const rows = vendasFiltradas.map(v => [
      v.id,
      new Date(v.data_venda || v.data).toLocaleString(),
      v.cliente_nome || 'Consumidor Final',
      v.nif_cliente || '---',
      exibirPreco(v.total),
      `${v.desconto || 0}%`,
      v.forma_pagamento,
      v.status,
      v.utilizador_nome || '---'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Dados exportados com sucesso!');
  };

  // Modal de detalhes da venda
  const DetalheModal = () => (
    <Modal
      isOpen={showDetalheModal}
      onClose={() => {
        setShowDetalheModal(false);
        setVendaSelecionada(null);
      }}
      title={`Venda #${vendaSelecionada?.id || ''}`}
      size="lg"
    >
      {vendaSelecionada && (
        <div className="space-y-4">
          {/* Informações da Venda */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{vendaSelecionada.cliente_nome || 'Consumidor Final'}</p>
              <p className="text-sm text-gray-500">NIF: {vendaSelecionada.nif_cliente || '---'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data</p>
              <p className="font-medium">
                {new Date(vendaSelecionada.data_venda || vendaSelecionada.data).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Vendedor: {vendaSelecionada.utilizador_nome || '---'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Forma Pagamento</p>
              <p className="font-medium capitalize">{vendaSelecionada.forma_pagamento}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                vendaSelecionada.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                vendaSelecionada.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {vendaSelecionada.status || 'pendente'}
              </span>
            </div>
          </div>

          {/* Itens da Venda */}
          <div>
            <h4 className="font-medium mb-2">Itens da Venda</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Produto</th>
                    <th className="px-4 py-2 text-right">Qtd</th>
                    <th className="px-4 py-2 text-right">Preço Unit.</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(vendaSelecionada.itens || []).map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item.medicamento_nome || item.nome || '---'}</td>
                      <td className="px-4 py-2 text-right">{item.quantidade}</td>
                      <td className="px-4 py-2 text-right">{exibirPreco(item.preco_unitario)}€</td>
                      <td className="px-4 py-2 text-right">{exibirPreco(item.subtotal)}€</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-medium">
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-right">Subtotal:</td>
                    <td className="px-4 py-2 text-right">{exibirPreco(vendaSelecionada.total || 0)}€</td>
                  </tr>
                  {vendaSelecionada.desconto > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right text-green-600">Desconto ({vendaSelecionada.desconto}%):</td>
                      <td className="px-4 py-2 text-right text-green-600">
                        -{exibirPreco(vendaSelecionada.total * vendaSelecionada.desconto / 100)}€
                      </td>
                    </tr>
                  )}
                  <tr className="text-lg">
                    <td colSpan="3" className="px-4 py-2 text-right font-bold">Total:</td>
                    <td className="px-4 py-2 text-right font-bold text-blue-600">
                      {exibirPreco(vendaSelecionada.total || 0)}€
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Observações */}
          {vendaSelecionada.observacoes && (
            <div>
              <h4 className="font-medium mb-1">Observações</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {vendaSelecionada.observacoes}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => imprimirRecibo(vendaSelecionada)}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Recibo
            </Button>
            <Button onClick={() => {
              setShowDetalheModal(false);
              setVendaSelecionada(null);
            }}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="secondary" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Vendas</h1>
            <p className="text-gray-600">Visualize e gerencie todas as vendas realizadas</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={exportarCSV} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="secondary" onClick={carregarVendas} size="sm">
            🔄 Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              className="input w-full"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              className="input w-full"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="input w-full"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="confirmada">Confirmada</option>
              <option value="pendente">Pendente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ID, cliente, NIF..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" size="sm" onClick={limparFiltros}>
            <Filter className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : vendasFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Nenhuma venda encontrada</p>
            <p className="text-sm">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendasFiltradas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">#{venda.id}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(venda.data_venda || venda.data).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{venda.cliente_nome || 'Consumidor Final'}</span>
                      </div>
                      {venda.nif_cliente && (
                        <span className="text-xs text-gray-400">NIF: {venda.nif_cliente}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                      {exibirPreco(venda.total)}€
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        venda.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                        venda.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {venda.status || 'pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => verDetalhes(venda)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => imprimirRecibo(venda)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-sm font-medium">
                    Total de Vendas: {vendasFiltradas.length}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    Total Geral: {exibirPreco(vendasFiltradas.reduce((sum, v) => sum + Number(v.total || 0), 0))}€
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <DetalheModal />
    </div>
  );
};