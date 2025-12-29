import { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RelatorioFilters } from '../components/relatorioFilter/RelatorioFilters';
import { estatisticasService } from '../services/estatisticasService';
import { equipamentosService } from '../services/equipamentosService';
import { RelatorioEquipamentos } from '../components/relatorio/RelatorioEquipamentos';
import { RelatorioFornecedores } from '../components/relatorio/RelatorioFornecedores';
import { RelatorioDepartamentos } from '../components/relatorio/RelatorioDepartamentos';

export const Relatorios = () => {
  const [filtros, setFiltros] = useState({
    tipo: 'equipamentos',
    periodo: '30',
    categoria: '',
    departamento: '',
    estado: '',
    fornecedor: ''
  });
  
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const relatorioRef = useRef(null);

  useEffect(() => {
    carregarDados();
  }, [filtros.tipo]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      let response;

      switch (filtros.tipo) {
        case 'equipamentos':
          response = await equipamentosService.getAll();
          setDados(response.data);
          break;
        case 'departamentos':
          response = await estatisticasService.getEquipamentosPorDepartamento();
          setDados(response.data);
          break;
        case 'fornecedores':
          response = await estatisticasService.getCustosPorCategoria();
          setDados(response.data);
          break;
        default:
          setDados([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = async () => {
    if (!dados || exporting) {
      console.log('Dados não disponíveis ou já exportando');
      return;
    }
    
    setExporting(true);
    try {
      // Aguarda um pequeno delay para garantir que o DOM foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = relatorioRef.current;
      console.log('Elemento referenciado:', element);
      
      if (!element || element.children.length === 0) {
        alert('Nenhum conteúdo disponível para exportar. Aguarde o carregamento dos dados.');
        return;
      }

      // Carrega as bibliotecas dinamicamente
      const [html2canvasModule, jspdfModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const html2canvas = html2canvasModule.default;
      const jsPDF = jspdfModule.default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true, // Ativa logging para debug
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`relatorio-${filtros.tipo}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const renderRelatorio = () => {
    if (loading) return <LoadingSpinner />;
    if (!dados) return <div>Nenhum dado disponível</div>;

    switch (filtros.tipo) {
      case 'equipamentos':
        return <RelatorioEquipamentos dados={dados} filtros={filtros} />;
      case 'departamentos':
        return <RelatorioDepartamentos dados={dados} filtros={filtros} />;
      case 'fornecedores':
        return <RelatorioFornecedores dados={dados} filtros={filtros} />;
      default:
        return <div>Selecione um tipo de relatório</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Estatísticas e análises do sistema</p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={exportarRelatorio} 
            disabled={!dados || loading || exporting}
          >
            {exporting ? (
              <LoadingSpinner className="w-4 h-4 mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      <RelatorioFilters onFilterChange={setFiltros} />

      {/* Container do relatório com ref - IMPORTANTE: esta div deve conter o conteúdo visível */}
      <div ref={relatorioRef} className="relatorio-content">
        {renderRelatorio()}
      </div>
    </div>
  );
};