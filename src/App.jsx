// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Venda } from './pages/Venda';
import { HistoricoVenda } from './pages/Historico_vend';
import { Categorias } from './pages/Categorias';
import { Produto } from './pages/Produto';
import { Lotes } from './pages/lotes';
import { Utilizadores } from './pages/Utilizadores';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Componente principal da aplicação com todas as rotas
function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </>
  );
}

// Componente de rotas - AGORA DENTRO DO AuthProvider
function AppRoutes() {
  return (
    <Routes>
      {/* Rota de Login - PÚBLICA */}
      <Route path="/login" element={<Login />} />
      
      {/* Rota do Callback - apenas para compatibilidade */}
      <Route path="/callback" element={<Navigate to="/login" replace />} />

      {/* Rotas Protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/utilizador" element={
        <ProtectedRoute>
          <Layout>
            <Utilizadores />
          </Layout>
        </ProtectedRoute>
      } />
        <Route path="/vendas/nova" element={
        <ProtectedRoute>
          <Layout>
            <Venda />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/categorias" element={
        <ProtectedRoute>
          <Layout>
            <Categorias />
          </Layout>
        </ProtectedRoute>
      } />

       <Route path="/Historico" element={
        <ProtectedRoute>
          <Layout>
            <HistoricoVenda />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/produto" element={
        <ProtectedRoute>
          <Layout>
            <Produto />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/lote/prod" element={
        <ProtectedRoute>
          <Layout>
            <Lotes />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rota 404 - Redireciona para login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// Componente para proteger rotas - USA o AuthContext (agora dentro do provider)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default App;