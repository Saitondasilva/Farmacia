import { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box, Alert, Snackbar, Chip, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Devices as DevicesIcon
} from '@mui/icons-material';
import { equipamentosService } from '../services/equipamentosService';

export const Marcas = () => {
    // Estados
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para o diálogo de nova marca
    const [openNovaMarcaDialog, setOpenNovaMarcaDialog] = useState(false);
    const [novaMarca, setNovaMarca] = useState('');

    // Carregar marcas e equipamentos
    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        try {
            // Carregar marcas
            const marcasResponse = await equipamentosService.getAllMarcas();
            setMarcas(marcasResponse.data || []);
        } catch (err) {
            setError('Erro ao carregar dados: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handler para criar nova marca diretamente
    const handleCriarNovaMarca = async () => {
        try {
            if (!novaMarca.trim()) {
                setError('Digite um nome para a marca');
                return;
            }

            await equipamentosService.createMarca({
                descricao: novaMarca.trim()
            });
            setSuccess(`Marca "${novaMarca}" criada com sucesso`);
            setNovaMarca('');
            setOpenNovaMarcaDialog(false);
            carregarDados();
        } catch (err) {
            setError('Erro ao criar marca: ' + err.message);
        }
    };

    // Estatísticas
    const estatisticas = {
        totalMarcas: marcas.length,
        equipamentosComMarca: marcas.filter(m => m.equipamento_id).length
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h6" align="center">Carregando...</Typography>
            </Container>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    <DevicesIcon /> Gerenciamento de Marcas
                </h1>
                <p className="text-gray-600">
                    Associe marcas aos equipamentos
                </p>
            </div>
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total de Marcas
                            </Typography>
                            <Typography variant="h4">
                                {estatisticas.totalMarcas}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Equip. com Marca
                            </Typography>
                            <Typography variant="h4">
                                {estatisticas.equipamentosComMarca}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Ações */}
            <div className="mb-3 flex gap-2 flex-wrap">
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNovaMarcaDialog(true)}
                >
                    Nova Marca
                </Button>
                <Button
                    variant="outlined"
                    onClick={carregarDados}
                >
                    Atualizar
                </Button>
            </div>

            {/* Tabela de Marcas */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Marca</th>
                            <th>Data de Registro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {marcas.length === 0 ? (
                            <tr>
                                <td colSpan={5} align="center">
                                    <Typography variant="body1" color="text.secondary">
                                        Nenhuma marca cadastrada
                                    </Typography>
                                </td>
                            </tr>
                        ) : (
                            marcas.map((marca) => (
                                <tr key={marca.id} hover>
                                    <td>{marca.id}</td>
                                    <td>
                                        <Chip
                                            label={marca.descricao || marca.nome || 'N/A'}
                                            color="primary"
                                            size="small"
                                        />
                                    </td>
                                    <td>
                                        {marca.data_registro ?
                                            new Date(marca.data_registro).toLocaleDateString('pt-BR') :
                                            'N/A'
                                        }
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Diálogo para Nova Marca */}
            <Dialog
                open={openNovaMarcaDialog}
                onClose={() => setOpenNovaMarcaDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Criar Nova Marca</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Nome da Marca"
                        value={novaMarca}
                        onChange={(e) => setNovaMarca(e.target.value)}
                        placeholder="Ex: Samsung, Apple, LG"
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNovaMarcaDialog(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCriarNovaMarca}
                        disabled={!novaMarca.trim()}
                    >
                        Criar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notificações */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setError('')} severity="error">
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccess('')} severity="success">
                    {success}
                </Alert>
            </Snackbar>
        </div>
    );
};
