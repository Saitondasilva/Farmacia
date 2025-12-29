import { useState, useEffect } from 'react';
import { departamentosService } from '../../services/departamentosService';

export const SalaSelect = ({
    departamentoId,
    value,
    onChange,
    className = '',
    disabled = false
}) => {
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (departamentoId) {
            loadSalasDoDepartamento(departamentoId);
        } else {
            setSalas([]);
        }
    }, [departamentoId]);

    const loadSalasDoDepartamento = async (deptId) => {
        setLoading(true);
        try {
            const response = await departamentosService.getById(deptId);
            console.log('Resposta completa do departamento:', response); // DEBUG
            
            let salasArray = [];
            
            // Diferentes formas de acessar os dados baseado na estrutura da resposta
            if (response.data && response.data.data) {
                // Formato: { success: true, data: { ... } }
                salasArray = response.data.data.salas || [];
            } else if (response.data && Array.isArray(response.data.salas)) {
                // Formato: { success: true, salas: [...] }
                salasArray = response.data.salas;
            } else if (Array.isArray(response.data)) {
                // Formato: [ { ... } ]
                salasArray = response.data[0]?.salas || [];
            }
            
            console.log('Salas extraídas:', salasArray); // DEBUG
            setSalas(Array.isArray(salasArray) ? salasArray : []);
        } catch (error) {
            console.error('Erro ao carregar salas:', error);
            setSalas([]);
        } finally {
            setLoading(false);
        }
    };

    if (!departamentoId) {
        return (
            <select
                value={value}
                onChange={onChange}
                className={className}
                disabled
            >
                <option value="">Selecione primeiro o departamento</option>
            </select>
        );
    }

    if (loading) {
        return (
            <select
                value={value}
                onChange={onChange}
                className={className}
                disabled
            >
                <option value="">Carregando salas...</option>
            </select>
        );
    }

    return (
        <select
            value={value}
            onChange={onChange}
            className={className}
            disabled={disabled || salas.length === 0}
        >
            <option value="">{salas.length === 0 ? 'Nenhuma sala disponível' : 'Selecionar sala'}</option>
            {salas.map((sala, index) => (
                <option key={index} value={sala}>
                    {sala}
                </option>
            ))}
        </select>
    );
};