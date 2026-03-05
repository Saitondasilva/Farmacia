// utils/generateInvestmentCode.js
export const generateInvestmentCode = () => {
  const getNextSequential = () => {
    try {
      const submissions = JSON.parse(localStorage.getItem('MOCK_INVESTIDORES') || '[]');
      
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const todayPrefix = `INV-${year}${month}${day}`;
      
      // Filtrar códigos de hoje
      const todayCodes = submissions
        .filter(s => s.codigo_identificacao && s.codigo_identificacao.startsWith(todayPrefix))
        .map(s => s.codigo_identificacao);
      
      if (todayCodes.length === 0) return '0001';
      
      // Encontrar o maior número sequencial
      let maxSeq = 0;
      todayCodes.forEach(code => {
        const parts = code.split('-');
        if (parts.length === 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
        }
      });
      
      return (maxSeq + 1).toString().padStart(4, '0');
    } catch (error) {
      console.error('Erro ao gerar código sequencial:', error);
      return '0001'; // fallback seguro
    }
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const sequential = getNextSequential();
  
  return `INV-${year}${month}${day}-${sequential}`;
};