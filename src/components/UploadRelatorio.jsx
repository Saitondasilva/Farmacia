// src/components/UploadRelatorio.jsx
import { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

export const UploadRelatorio = ({ onUpload, instituicao, processoId, tipo }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const tiposPermitidos = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (!selectedFile) return;

    // Validar tipo
    const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!tiposPermitidos.includes(fileExt)) {
      setError('Tipo de arquivo não permitido. Use: PDF, DOC, DOCX, JPG, PNG');
      return;
    }

    // Validar tamanho
    if (selectedFile.size > maxSize) {
      setError('Arquivo muito grande. Máximo 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    // Simular upload
    setTimeout(() => {
      const relatorio = {
        id: Date.now(),
        nome: file.name,
        tipo: tipo,
        instituicao: instituicao,
        data: new Date().toISOString(),
        processoId: processoId,
        tamanho: (file.size / 1024).toFixed(1) + ' KB',
        url: URL.createObjectURL(file)
      };

      onUpload(relatorio);
      setFile(null);
      setUploading(false);
    }, 1500);
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
  };

  return (
    <div className="border rounded-lg p-4">
      {!file ? (
        <div className="space-y-2">
          <label className="relative cursor-pointer block">
            <input
              type="file"
              onChange={handleFileChange}
              accept={tiposPermitidos.join(',')}
              className="sr-only"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Clique para selecionar o relatório
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, JPG ou PNG (máx. 10MB)
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploading || !!error}
              size="sm"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Relatório
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};