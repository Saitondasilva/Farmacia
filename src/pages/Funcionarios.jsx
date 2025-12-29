import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Flag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DEFAULT_INVESTIDORES = [
  {
    id: 1,
    nome_completo: 'João Manuel Silva',
    data_nascimento: '1985-06-15',
    nacionalidade: 'Portuguesa',
    passaporte_numero: 'P1234567',
    passaporte_validade: '2030-12-31',
    bi_numero: '12345678LA',
    email: 'joao.silva@email.com',
    telefone: '+351912345678',
    tipo: 'INVESTIMENTO',
    valor_investimento: 150000,
    status: 'PENDENTE'
  },
  {
    id: 2,
    nome_completo: 'Maria Fernanda Costa',
    data_nascimento: '1990-02-20',
    nacionalidade: 'Brasileira',
    passaporte_numero: 'BR998877',
    passaporte_validade: '2029-05-10',
    bi_numero: '',
    email: 'maria.costa@email.com',
    telefone: '+551199999999',
    tipo: 'DOAÇÃO',
    valor_investimento: 90000,
    status: 'ENVIADO'
  }
];

export const FomularioInvestimento = () => {
  const [investidores, setInvestidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'PENDENTE', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'EM VERIFICAÇÃO', label: 'Em Verificação', color: 'bg-blue-100 text-blue-800' },
    { value: 'APROVADO', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
    { value: 'REJEITADO', label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
    { value: 'SUSPENSO', label: 'Suspenso', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || 'null');
    if (stored && Array.isArray(stored)) {
      setInvestidores(stored);
      setLoading(false);
      return;
    }

    // fallback to default
    setTimeout(() => {
      setInvestidores(DEFAULT_INVESTIDORES);
      setLoading(false);
    }, 200);
  }, []);

  const save = (next) => {
    setInvestidores(next);
    localStorage.setItem('MOCK_INVESTIDORES', JSON.stringify(next));
  };

  const handleCreate = () => navigate('/formulario-investimento');
  const handleEdit = (inv) => navigate(`/formulario-investimento?id=${inv.id}`);

  const handleDelete = (id) => {
    if (!confirm('Tem certeza que deseja eliminar este investidor?')) return;
    save(investidores.filter(i => i.id !== id));
  };

  const filteredInvestidores = investidores.filter(inv => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || (
      inv.nome_completo?.toLowerCase().includes(q) ||
      inv.email?.toLowerCase().includes(q) ||
      inv.passaporte_numero?.toLowerCase().includes(q) ||
      inv.bi_numero?.toLowerCase().includes(q)
    );
    const matchesStatus = !filterStatus || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
  const formatDate = (d) => d ? format(parseISO(d), 'dd/MM/yyyy', { locale: ptBR }) : '';

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investidores</h1>
          <p className="text-gray-600">Gerir investidores e beneficiários</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Investidor
        </Button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Pesquisar por nome, email, passaporte ou BI..." className="input pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="sm:w-48">
            <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredInvestidores.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum investidor encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">{searchTerm || filterStatus ? 'Tente alterar os filtros de pesquisa.' : 'Comece por adicionar um novo investidor.'}</p>
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {filteredInvestidores.map(inv => (
              <div key={inv.id} className="border rounded-lg p-3 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{inv.nome_completo}</div>
                    <div className="text-sm text-gray-500">{inv.nacionalidade}</div>
                    <div className="text-sm font-mono text-gray-700 mt-1">{inv.passaporte_numero}</div>
                    {inv.passaporte_validade && <div className="text-xs text-gray-500">Validade: {formatDate(inv.passaporte_validade)}</div>}
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusOptions.find(s => s.value === inv.status)?.color || 'bg-gray-100 text-gray-800'}`}>{statusOptions.find(s => s.value === inv.status)?.label || inv.status}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(inv)} className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2">Nome Completo</th>
                  <th className="text-left px-3 py-2">Nacionalidade</th>
                  <th className="text-left px-3 py-2">Passaporte</th>
                  <th className="text-left px-3 py-2">Tipo</th>
                  <th className="text-left px-3 py-2">Valor (USD)</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Telefone</th>
                  <th className="text-left px-3 py-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvestidores.map(inv => (
                  <tr key={inv.id} className="align-top">
                    <td className="px-3 py-2 align-top font-medium whitespace-nowrap">{inv.nome_completo}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Flag className="w-3 h-3 mr-1" />{inv.nacionalidade}</span></td>
                    <td className="px-3 py-2 align-top whitespace-nowrap"><div className="font-mono text-sm">{inv.passaporte_numero}</div>{inv.passaporte_validade && <div className="text-xs text-gray-500">Validade: {formatDate(inv.passaporte_validade)}</div>}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.tipo === 'INVESTIMENTO' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'}`}>{inv.tipo === 'INVESTIMENTO' ? 'Investimento' : 'Doação'}</span></td>
                    <td className="px-3 py-2 align-top whitespace-nowrap font-semibold">{formatCurrency(inv.valor_investimento)}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOptions.find(s => s.value === inv.status)?.color || 'bg-gray-100 text-gray-800'}`}>{statusOptions.find(s => s.value === inv.status)?.label || inv.status}</span></td>
                    <td className="px-3 py-2 align-top whitespace-nowrap">{inv.email}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap">{inv.telefone}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap"><div className="flex space-x-2"><button onClick={() => handleEdit(inv)} className="text-blue-600 hover:text-blue-900" title="Editar"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-900" title="Eliminar"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};