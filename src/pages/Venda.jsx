// pages/Venda.jsx - Versão corrigida e completa
import { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, ShoppingCart, 
  User, ArrowLeft, Printer, CheckCircle,
  Minus, Plus as PlusIcon, UserPlus, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { vendasService } from '../services/vendasService';
import { medicamentoService } from '../services/medicamentoService';
import { lotesService } from '../services/lotesService';
import { clientesService } from '../services/clientesService';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

export const Venda = ({ onBack }) => {
  const { user } = useAuth();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentosFiltrados, setMedicamentosFiltrados] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNovoClienteModal, setShowNovoClienteModal] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [desconto, setDesconto] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [nifCliente, setNifCliente] = useState('');
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null);
  const [lotesDisponiveis, setLotesDisponiveis] = useState([]);
  const [loteSelecionado, setLoteSelecionado] = useState(null);
  const [searchCliente, setSearchCliente] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerCliente, handleSubmit: handleSubmitCliente, reset: resetCliente, formState: { errors: errorsCliente } } = useForm();

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
    carregarMedicamentos();
    carregarClientes();
  }, []);

  const carregarMedicamentos = async () => {
    try {
      setLoading(true);
      const res = await medicamentoService.getAll();
      console.log('📦 Medicamentos carregados:', res?.length);
      setMedicamentos(res || []);
      setMedicamentosFiltrados(res || []);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
      toast.error('Erro ao carregar medicamentos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const carregarClientes = async () => {
    try {
      const res = await clientesService.getAll();
      setClientes(res || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  const carregarLotes = async (medicamentoId) => {
    try {
      const res = await lotesService.getByMedicamento(medicamentoId);
      console.log('📦 Lotes carregados:', res?.length);
      const lotesDisponiveis = (res || []).filter(lote => lote.quantidade > 0);
      setLotesDisponiveis(lotesDisponiveis);
      if (lotesDisponiveis.length > 0) {
        setLoteSelecionado(lotesDisponiveis[0]);
      } else {
        setLoteSelecionado(null);
        toast.warning('Este medicamento não tem lotes disponíveis');
      }
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
      toast.error('Erro ao carregar lotes');
    }
  };

  // Filtro de medicamentos - CORRIGIDO
  const handleBuscaProduto = (search) => {
    setBuscaProduto(search);
    
    if (!search || !search.trim()) {
      setMedicamentosFiltrados(medicamentos);
      return;
    }
    
    const searchLower = search.toLowerCase().trim();
    const filtrados = medicamentos.filter(m =>
      m.nome?.toLowerCase().includes(searchLower) ||
      m.codigo_barras?.toLowerCase().includes(searchLower) ||
      m.dosagem?.toLowerCase().includes(searchLower) ||
      m.nome_generico?.toLowerCase().includes(searchLower) ||
      m.categoria_nome?.toLowerCase().includes(searchLower)
    );
    
    console.log('🔍 Resultados da busca:', filtrados.length);
    setMedicamentosFiltrados(filtrados);
  };

  // Filtro de clientes
  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.nif?.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.telefone?.toLowerCase().includes(searchCliente.toLowerCase())
  );

  // Adicionar ao carrinho - CORRIGIDO
  const adicionarAoCarrinho = (medicamento, lote, quantidade = 1) => {
    if (!lote) {
      toast.warning('Selecione um lote válido');
      return;
    }

    if (quantidade > lote.quantidade) {
      toast.warning('Quantidade insuficiente no lote');
      return;
    }

    const precoUnitario = formatarPreco(medicamento.preco_venda || medicamento.preco || 0);

    const itemExistente = carrinho.find(item => 
      item.medicamento_id === medicamento.id && item.lote_id === lote.id
    );
    
    if (itemExistente) {
      if (itemExistente.quantidade + quantidade > lote.quantidade) {
        toast.warning('Estoque insuficiente no lote');
        return;
      }
      setCarrinho(carrinho.map(item =>
        item.medicamento_id === medicamento.id && item.lote_id === lote.id
          ? { ...item, quantidade: item.quantidade + quantidade, subtotal: precoUnitario * (item.quantidade + quantidade) }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        medicamento_id: medicamento.id,
        lote_id: lote.id,
        nome: medicamento.nome || 'Sem nome',
        codigo: medicamento.codigo_barras || '',
        lote: lote.numero_lote || lote.codigo || '',
        quantidade: quantidade,
        preco_unitario: precoUnitario,
        subtotal: precoUnitario * quantidade,
        estoque: lote.quantidade || 0,
        validade: lote.data_validade || new Date()
      }]);
    }
    toast.success(`${medicamento.nome} adicionado ao carrinho`);
  };

  // Remover do carrinho
  const removerDoCarrinho = (index) => {
    const novoCarrinho = carrinho.filter((_, i) => i !== index);
    setCarrinho(novoCarrinho);
    toast.info('Item removido do carrinho');
  };

  // Atualizar quantidade
  const atualizarQuantidade = (index, novaQuantidade) => {
    if (novaQuantidade < 1) return;
    const item = carrinho[index];
    if (novaQuantidade > item.estoque) {
      toast.warning('Estoque insuficiente');
      return;
    }
    const novoCarrinho = [...carrinho];
    novoCarrinho[index].quantidade = novaQuantidade;
    novoCarrinho[index].subtotal = novoCarrinho[index].preco_unitario * novaQuantidade;
    setCarrinho(novoCarrinho);
  };

  // Calcular totais
  const calcularTotais = () => {
    const subtotal = carrinho.reduce((total, item) => total + (item.subtotal || 0), 0);
    const totalDesconto = (subtotal * (desconto / 100));
    const total = subtotal - totalDesconto;
    return { subtotal, totalDesconto, total };
  };

  const { subtotal, totalDesconto, total } = calcularTotais();

  // Selecionar cliente
  const selecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setNifCliente(cliente.nif || '');
    setShowClienteModal(false);
    toast.success(`Cliente selecionado: ${cliente.nome}`);
  };

  // Criar novo cliente
  const criarCliente = async (data) => {
    try {
      const response = await clientesService.create(data);
      toast.success('Cliente criado com sucesso!');
      setShowNovoClienteModal(false);
      resetCliente();
      await carregarClientes();
      selecionarCliente(response);
    } catch (error) {
      toast.error('Erro ao criar cliente: ' + (error.response?.data?.message || 'Tente novamente'));
    }
  };

  // Finalizar venda
  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      toast.warning('Carrinho vazio');
      return;
    }

    // No início da função finalizarVenda, adicione um log para debug
console.log('👤 User object:', user);
console.log('🆔 User ID:', user?.id);

    if (!formaPagamento) {
      toast.warning('Selecione uma forma de pagamento');
      return;
    }

    setLoading(true);
    try {
      const vendaData = {
        cliente_id: clienteSelecionado?.id || null,
        utilizador_id: user?.id || 1,
        total: total,
        desconto: desconto,
        forma_pagamento: formaPagamento,
        status: 'confirmada',
        nif_cliente: nifCliente || clienteSelecionado?.nif || '',
        observacoes: observacoes,
        itens: carrinho.map(item => ({
          medicamento_id: item.medicamento_id,
          lote_id: item.lote_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          desconto: 0,
          subtotal: item.subtotal
        }))
      };

      const response = await vendasService.create(vendaData);
      
      toast.success('Venda finalizada com sucesso!');
      if (window.confirm('Deseja imprimir o recibo?')) {
        imprimirRecibo(response);
      }
      setCarrinho([]);
      setClienteSelecionado(null);
      setNifCliente('');
      setObservacoes('');
      setDesconto(0);
      setFormaPagamento('dinheiro');
      carregarMedicamentos();
      carregarClientes();
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast.error('Erro ao finalizar venda: ' + (error.response?.data?.message || 'Tente novamente'));
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Imprimir recibo
  const imprimirRecibo = (venda) => {
    const reciboWindow = window.open('', '_blank', 'width=400,height=600');
    if (!reciboWindow) {
      toast.error('Permita pop-ups para imprimir o recibo');
      return;
    }
    
    const itens = venda.itens || carrinho;
    const vendaData = venda.data ? new Date(venda.data).toLocaleString() : new Date().toLocaleString();
    
    reciboWindow.document.write(`
      <html>
        <head>
          <title>Recibo - Venda #${venda.id || 'RASCUNHO'}</title>
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
            <p><strong>Venda #${venda.id || 'RASCUNHO'}</strong></p>
            <p>${vendaData}</p>
          </div>
          
          <div class="cliente">
            <p><strong>Cliente:</strong> ${venda.cliente?.nome || clienteSelecionado?.nome || 'Consumidor Final'}</p>
            <p><strong>NIF:</strong> ${venda.nif_cliente || nifCliente || '---'}</p>
            <p><strong>Vendedor:</strong> ${user?.nome || '---'}</p>
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
                  <td>${item.nome || item.medicamento?.nome || '---'}</td>
                  <td class="text-right">${item.quantidade}</td>
                  <td class="text-right">${exibirPreco(item.preco_unitario)}</td>
                  <td class="text-right">${exibirPreco(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totais">
            <p>Subtotal: <span class="text-right">${exibirPreco(subtotal || venda.total || 0)}€</span></p>
            ${desconto > 0 ? `<p>Desconto (${desconto}%): <span class="text-right">-${exibirPreco(totalDesconto || 0)}€</span></p>` : ''}
            <p class="total-final">TOTAL: ${exibirPreco(total || venda.total || 0)}€</p>
            <p>Forma Pagamento: ${venda.forma_pagamento || formaPagamento}</p>
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

  // Modal de seleção de medicamentos
  const ProdutoModal = () => (
    <Modal
      isOpen={showProdutoModal}
      onClose={() => {
        setShowProdutoModal(false);
        setBuscaProduto('');
        setMedicamentosFiltrados(medicamentos);
      }}
      title="Selecionar Medicamento"
      size="lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar medicamentos por nome, código ou princípio ativo..."
            className="input pl-10"
            value={buscaProduto}
            onChange={(e) => handleBuscaProduto(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {medicamentosFiltrados.length > 0 ? (
            medicamentosFiltrados.map(medicamento => {
              const preco = formatarPreco(medicamento.preco_venda || medicamento.preco || 0);
              return (
                <div
                  key={medicamento.id}
                  className="p-3 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  onClick={async () => {
                    setMedicamentoSelecionado(medicamento);
                    await carregarLotes(medicamento.id);
                    setShowLoteModal(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">{medicamento.nome || 'Sem nome'}</h4>
                      <p className="text-xs text-gray-500">Código: {medicamento.codigo_barras || '---'}</p>
                      <p className="text-xs text-gray-500">Dosagem: {medicamento.dosagem || '---'}</p>
                      {medicamento.categoria_nome && (
                        <p className="text-xs text-gray-500">Categoria: {medicamento.categoria_nome}</p>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-blue-600">{preco.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              {buscaProduto ? 'Nenhum medicamento encontrado' : 'Digite para buscar medicamentos'}
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-2 border-t">
          <Button variant="secondary" onClick={() => {
            setShowProdutoModal(false);
            setBuscaProduto('');
            setMedicamentosFiltrados(medicamentos);
          }}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Modal de seleção de lote e quantidade
  const LoteModal = () => (
    <Modal
      isOpen={showLoteModal}
      onClose={() => {
        setShowLoteModal(false);
        setMedicamentoSelecionado(null);
        setLoteSelecionado(null);
        setQuantidadeSelecionada(1);
      }}
      title={`Selecionar Lote - ${medicamentoSelecionado?.nome || 'Medicamento'}`}
    >
      <div className="space-y-4">
        {lotesDisponiveis.length === 0 ? (
          <div className="text-center py-8 text-yellow-600">
            <p>⚠️ Não há lotes disponíveis para este medicamento</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Selecione o Lote</label>
              <select
                className="input w-full"
                value={loteSelecionado?.id || ''}
                onChange={(e) => {
                  const lote = lotesDisponiveis.find(l => l.id === parseInt(e.target.value));
                  setLoteSelecionado(lote);
                }}
              >
                <option value="">Selecione um lote...</option>
                {lotesDisponiveis.map(lote => (
                  <option key={lote.id} value={lote.id}>
                    {lote.numero_lote || lote.codigo} - Estoque: {lote.quantidade} - Validade: {new Date(lote.data_validade).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {loteSelecionado && (
              <>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Lote: {loteSelecionado.numero_lote || loteSelecionado.codigo}</p>
                  <p className="text-sm text-gray-600">Estoque disponível: {loteSelecionado.quantidade}</p>
                  <p className="text-sm text-gray-600">Validade: {new Date(loteSelecionado.data_validade).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Preço unitário: {exibirPreco(medicamentoSelecionado?.preco_venda || medicamentoSelecionado?.preco || 0)}€</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    <button
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      onClick={() => setQuantidadeSelecionada(Math.max(1, quantidadeSelecionada - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold w-16 text-center">{quantidadeSelecionada}</span>
                    <button
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      onClick={() => setQuantidadeSelecionada(Math.min(
                        loteSelecionado?.quantidade || 999,
                        quantidadeSelecionada + 1
                      ))}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Total: {exibirPreco((formatarPreco(medicamentoSelecionado?.preco_venda || medicamentoSelecionado?.preco || 0)) * quantidadeSelecionada)}€
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowLoteModal(false);
                      setMedicamentoSelecionado(null);
                      setLoteSelecionado(null);
                      setQuantidadeSelecionada(1);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (medicamentoSelecionado && loteSelecionado) {
                        adicionarAoCarrinho(medicamentoSelecionado, loteSelecionado, quantidadeSelecionada);
                        setShowLoteModal(false);
                        setShowProdutoModal(false);
                        setMedicamentoSelecionado(null);
                        setLoteSelecionado(null);
                        setQuantidadeSelecionada(1);
                        setBuscaProduto('');
                        setMedicamentosFiltrados(medicamentos);
                      }
                    }}
                    disabled={!loteSelecionado}
                  >
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );

  // Modal de cliente
  const ClienteModal = () => (
    <Modal
      isOpen={showClienteModal}
      onClose={() => {
        setShowClienteModal(false);
        setSearchCliente('');
      }}
      title="Selecionar Cliente"
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cliente por nome, email, NIF ou telefone..."
              className="input pl-10"
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
              autoFocus
            />
          </div>
          <Button onClick={() => {
            setShowNovoClienteModal(true);
            resetCliente();
          }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map(cliente => (
              <div
                key={cliente.id}
                className="p-3 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors flex justify-between items-center"
                onClick={() => selecionarCliente(cliente)}
              >
                <div>
                  <h4 className="font-medium">{cliente.nome}</h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    {cliente.email && <span>📧 {cliente.email}</span>}
                    {cliente.telefone && <span>📱 {cliente.telefone}</span>}
                  </div>
                </div>
                <div className="text-sm">
                  <p>NIF: {cliente.nif || '---'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchCliente ? 'Nenhum cliente encontrado' : 'Digite para buscar clientes'}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );

  // Modal de novo cliente
  const NovoClienteModal = () => (
    <Modal
      isOpen={showNovoClienteModal}
      onClose={() => {
        setShowNovoClienteModal(false);
        resetCliente();
      }}
      title="Novo Cliente"
    >
      <form onSubmit={handleSubmitCliente(criarCliente)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome *</label>
          <input
            {...registerCliente('nome', { required: 'Nome é obrigatório' })}
            className="input mt-1"
            placeholder="Nome completo"
          />
          {errorsCliente.nome && <p className="text-sm text-red-600">{errorsCliente.nome.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...registerCliente('email')}
              type="email"
              className="input mt-1"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              {...registerCliente('telefone')}
              className="input mt-1"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">NIF</label>
          <input
            {...registerCliente('nif')}
            className="input mt-1"
            placeholder="123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Endereço</label>
          <textarea
            {...registerCliente('endereco')}
            className="input mt-1"
            rows="2"
            placeholder="Rua, número, complemento..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowNovoClienteModal(false);
              resetCliente();
            }}
          >
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Salvar Cliente
          </Button>
        </div>
      </form>
    </Modal>
  );

  // Modal de confirmação
  const ConfirmModal = () => (
    <Modal
      isOpen={showConfirmModal}
      onClose={() => setShowConfirmModal(false)}
      title="Confirmar Venda"
    >
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cliente:</span>
            <span className="font-medium">{clienteSelecionado?.nome || 'Consumidor Final'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Itens:</span>
            <span className="font-medium">{carrinho.length} produtos</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-blue-600">{exibirPreco(total)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Forma Pagamento:</span>
            <span className="font-medium capitalize">{formaPagamento}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={finalizarVenda}
            loading={loading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar Venda
          </Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="secondary" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Venda</h1>
            <p className="text-gray-600">Adicione medicamentos ao carrinho e finalize a venda</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={carregarMedicamentos} size="sm">
            🔄 Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda - Produtos e Cliente */}
        <div className="lg:col-span-2 space-y-4">
          {/* Seleção de Cliente */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {clienteSelecionado ? clienteSelecionado.nome : 'Consumidor Final'}
                  </p>
                  {clienteSelecionado && (
                    <p className="text-sm text-gray-500">
                      {clienteSelecionado.email || clienteSelecionado.telefone || 'Sem contato'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" onClick={() => setShowClienteModal(true)}>
                  {clienteSelecionado ? 'Alterar' : 'Selecionar Cliente'}
                </Button>
                {clienteSelecionado && (
                  <Button variant="secondary" size="sm" onClick={() => setClienteSelecionado(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            {!clienteSelecionado && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="NIF do cliente (opcional)"
                  className="input w-full md:w-64"
                  value={nifCliente}
                  onChange={(e) => setNifCliente(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Busca de Medicamentos */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar medicamento por nome, código ou dosagem..."
                  className="input pl-10"
                  value={buscaProduto}
                  onChange={(e) => handleBuscaProduto(e.target.value)}
                />
              </div>
              <Button onClick={() => {
                setShowProdutoModal(true);
                setMedicamentosFiltrados(medicamentos);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de Medicamentos Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {medicamentosFiltrados.slice(0, 8).map(medicamento => {
              const preco = formatarPreco(medicamento.preco_venda || medicamento.preco || 0);
              return (
                <button
                  key={medicamento.id}
                  className="p-3 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  onClick={async () => {
                    setMedicamentoSelecionado(medicamento);
                    await carregarLotes(medicamento.id);
                    setShowLoteModal(true);
                  }}
                >
                  <p className="font-medium text-sm truncate">{medicamento.nome || 'Sem nome'}</p>
                  <p className="text-xs text-gray-500 truncate">{medicamento.dosagem || ''}</p>
                  <p className="text-blue-600 font-bold text-sm">{preco.toFixed(2)}€</p>
                </button>
              );
            })}
          </div>
          {medicamentosFiltrados.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              {buscaProduto ? 'Nenhum medicamento encontrado' : 'Digite para buscar medicamentos'}
            </div>
          )}
        </div>

        {/* Coluna da Direita - Carrinho */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Carrinho
                <span className="ml-2 text-sm text-gray-500">({carrinho.length})</span>
              </h2>
              {carrinho.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                      setCarrinho([]);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Itens do Carrinho */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {carrinho.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>Carrinho vazio</p>
                  <p className="text-sm">Adicione medicamentos</p>
                </div>
              ) : (
                carrinho.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.nome || 'Sem nome'}</p>
                        <p className="text-xs text-gray-500">Lote: {item.lote || '---'}</p>
                        {item.validade && (
                          <p className="text-xs text-gray-500">Validade: {new Date(item.validade).toLocaleDateString()}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <button
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200"
                            onClick={() => atualizarQuantidade(index, item.quantidade - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantidade}</span>
                          <button
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200"
                            onClick={() => atualizarQuantidade(index, item.quantidade + 1)}
                            disabled={item.quantidade >= item.estoque}
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          {exibirPreco(item.subtotal)}€
                        </p>
                        <p className="text-xs text-gray-500">
                          {exibirPreco(item.preco_unitario)}€/un
                        </p>
                        <button
                          className="text-red-500 hover:text-red-700 mt-1"
                          onClick={() => removerDoCarrinho(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totais */}
            {carrinho.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{exibirPreco(subtotal)}€</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span>Desconto (%):</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="input w-20 text-right"
                        value={desconto}
                        onChange={(e) => setDesconto(Number(e.target.value) || 0)}
                        min="0"
                        max="100"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  {desconto > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto aplicado:</span>
                      <span>-{exibirPreco(totalDesconto)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">{exibirPreco(total)}€</span>
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    className="input w-full"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência Bancária</option>
                  </select>
                </div>

                {/* Observações */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    className="input w-full"
                    rows="2"
                    placeholder="Observações sobre a venda..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                </div>

                {/* Botões */}
                <div className="mt-4 space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={carrinho.length === 0}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Venda
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      if (carrinho.length > 0) {
                        imprimirRecibo({
                          id: 'RASCUNHO',
                          data: new Date().toISOString(),
                          cliente: clienteSelecionado,
                          nif_cliente: nifCliente,
                          utilizador: user,
                          itens: carrinho,
                          total: total,
                          desconto: desconto,
                          forma_pagamento: formaPagamento
                        });
                      }
                    }}
                    disabled={carrinho.length === 0}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Pré-visualizar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProdutoModal />
      <LoteModal />
      <ClienteModal />
      <NovoClienteModal />
      <ConfirmModal />
    </div>
  );
};