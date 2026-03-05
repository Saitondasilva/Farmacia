// components/AcompanhamentoProcesso.jsx
import React from 'react';
import { CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { INSTITUICOES } from '../utils/constants';
import { format, parseISO } from 'date-fns';

export const AcompanhamentoProcesso = ({ workflow }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'APROVADO': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'RECUSADO': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'EXPIRADO': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APROVADO': return 'text-green-700 bg-green-50';
      case 'RECUSADO': return 'text-red-700 bg-red-50';
      case 'EXPIRADO': return 'text-gray-700 bg-gray-50';
      default: return 'text-yellow-700 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Fluxo do Processo</h3>
      
      <div className="relative">
        {workflow.historico.map((item, index) => {
          const instituicao = INSTITUICOES[item.instituicao.toUpperCase()];
          const isUltimo = index === workflow.historico.length - 1;
          
          return (
            <div key={index} className="mb-6 relative">
              {/* Linha conectora */}
              {!isUltimo && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
              )}
              
              <div className="flex items-start">
                {/* Ícone */}
                <div className="flex-shrink-0 mr-3">
                  {getStatusIcon(item.status)}
                </div>
                
                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{instituicao?.nome}</span>
                    <ArrowRight className="w-3 h-3 mx-2 text-gray-400" />
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Recebido: {format(parseISO(item.data_recebimento), 'dd/MM/yyyy HH:mm')}</p>
                    {item.data_analise && (
                      <p>Analisado: {format(parseISO(item.data_analise), 'dd/MM/yyyy HH:mm')}</p>
                    )}
                    {item.observacoes && (
                      <p className="text-xs text-gray-500 mt-1">Obs: {item.observacoes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};