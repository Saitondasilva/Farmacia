import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, CheckCircle, Info, Package } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "warning", // warning, danger, info, success
  loading = false,
  // NOVAS PROPS para suportar múltiplos equipamentos
  equipamentos = [],
  funcionario = null,
  tipoDevolucao = 'individual' // 'individual' ou 'todos'
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'success':
        return 'primary';
      case 'info':
        return 'primary';
      default:
        return 'warning';
    }
  };

  // Verificar se é uma devolução com múltiplos equipamentos
  const isDevolucaoMultipla = equipamentos && equipamentos.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isDevolucaoMultipla ? "md" : "sm"}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>

        {/* Informações do funcionário se for devolução */}
        {funcionario && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-700 font-medium">
              {funcionario.nome} - {funcionario.cargo}
            </p>
            <p className="text-xs text-blue-600">
              Departamento: {funcionario.departamento} • Sala: {funcionario.sala}
            </p>
          </div>
        )}

        {/* Lista de equipamentos se for devolução múltipla */}
        {isDevolucaoMultipla && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-4 h-4 text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-900">
                {tipoDevolucao === 'todos' ? 'Todos os Equipamentos' : 'Equipamento a Devolver'}
              </h4>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {equipamentos.map((equipamento, index) => (
                <div key={equipamento.id || index} className="flex justify-between items-center bg-white p-2 rounded border">
                  <div className="text-left">
                    <div className="font-medium text-sm">{equipamento.modelo}</div>
                    <div className="text-xs text-gray-500 font-mono">{equipamento.numero_serie}</div>
                  </div>
                  {tipoDevolucao === 'individual' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      A devolver
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {tipoDevolucao === 'todos' && (
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <p className="text-sm text-yellow-700 font-medium">
                  Total: {equipamentos.length} equipamento(s)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mensagem principal */}
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        {/* Informação adicional para devoluções múltiplas */}
        {isDevolucaoMultipla && tipoDevolucao === 'todos' && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-xs text-gray-600">
              ⚠️ Todos os equipamentos listados acima serão devolvidos.
            </p>
          </div>
        )}

        <div className="flex justify-center space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
            {isDevolucaoMultipla && tipoDevolucao === 'todos' && (
              <span className="ml-1">({equipamentos.length})</span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};