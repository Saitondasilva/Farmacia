import { ReactKeycloakProvider } from '@react-keycloak/web';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import keycloak from './keycloak/keycloak-config';
import { useKeycloak } from '@react-keycloak/web';
import { AuthProvider} from './contexts/AuthContext';
import Callback from './Callback';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
//import { Equipamentos } from './pages/Equipamentos';
//import { Departamentos } from './pages/Departamentos';
import { FomularioInvestimento } from './pages/Funcionarios';
import FormularioInvestimento from './pages/FormularioInvestimento';
import { Investidores } from './pages/Fornecedores';
//import { Atribuicoes } from './pages/Atribuicoes';
//import { Categorias } from './pages/Categorias';
//import { Relatorios } from './pages/Relatorios';
//import { Marcas } from './pages/Marca';
//import { Perfil } from './pages/Perfil';
//import { HistoricoMovimentacoes } from './pages/HistoricoMovimentacoes';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useEffect } from 'react';

// Componente para lidar com redirecionamento após login
const AuthCallbackHandler = () => {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      // Se acabou de voltar do Keycloak com token
      const params = new URLSearchParams(location.search);

      // Remove parâmetros da URL do Keycloak
      if (params.has('state') || params.has('code') || params.has('session_state')) {
        const redirectPath = localStorage.getItem('keycloak_redirect') || '/dashboard';
        localStorage.removeItem('keycloak_redirect');

        // Navega para a página desejada sem os parâmetros
        navigate(redirectPath, { replace: true });
      }
    }
  }, [initialized, keycloak.authenticated, navigate, location]);

  return null;
};

// ProtectedRoute usando useAuth (que agora usa Keycloak internamente)
const ProtectedRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!keycloak.authenticated) {
    const redirectUri = `${window.location.origin}/callback`;

    // Configura o redirectUri para voltar à página atual
    const options = {
      redirectUri: redirectUri,
      prompt: 'login'
    };

    // Armazena a página original para redirecionar depois
    localStorage.setItem('keycloak_original_path', location.pathname);

    keycloak.login(options);

    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecionando para login..." />
      </div>
    );
  }

  return (
    <>
      <AuthCallbackHandler />
      {children}
    </>
  );
};

function KeycloakProviderWrapper({ children }) {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        redirectUri: window.location.origin + '/callback',
        responseMode: 'query'
      }}
    >
      {children}
    </ReactKeycloakProvider>
  );
}

function AppRoutes() {

  return (
    <Router>
      <Routes>
        <Route path="/callback" element={<Callback />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/formulario-investimento" element={
          <ProtectedRoute>
            <Layout>
              <FormularioInvestimento />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/investidores" element={
          <ProtectedRoute>
            <Layout>
              <FomularioInvestimento />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/ver-investidores" element={
          <ProtectedRoute>
            <Layout>
              <Investidores />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Componente principal SEM ReactKeycloakProvider redundante
function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <KeycloakProviderWrapper>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </KeycloakProviderWrapper>
    </>
  );
}

export default App;