// contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// CONSTANTES FIXAS - SEM process.env
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem('auth_user');

        console.log('🔍 AuthProvider - Inicializando:', { 
          hasToken: !!savedToken, 
          hasUser: !!savedUser 
        });

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Validar token com o backend
          try {
            const response = await authService.getMe();
            if (response.success) {
              setUser(response.data);
              localStorage.setItem('auth_user', JSON.stringify(response.data));
            }
          } catch (error) {
            console.error('❌ Token inválido:', error);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem('auth_user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      console.log('🔍 Tentando login com:', credentials.email);

      const response = await authService.login(credentials);
      
      if (response.success) {
        // Salva token e usuário
        localStorage.setItem(TOKEN_KEY, response.token);
        if (response.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        }
        localStorage.setItem('auth_user', JSON.stringify(response.usuario));
        
        setToken(response.token);
        setUser(response.usuario);
        
        console.log('✅ Login bem-sucedido:', response.usuario.nome);
        
        return { success: true, user: response.usuario };
      } else {
        console.log('❌ Login falhou:', response.error);
        return { 
          success: false, 
          message: response.error || 'Erro ao fazer login' 
        };
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      let message = 'Erro ao fazer login. Tente novamente.';
      
      if (error.response) {
        message = error.response.data?.error || message;
      } else if (error.request) {
        message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('auth_user');
      setToken(null);
      setUser(null);
      setLoading(false);
      console.log('🔓 Logout realizado');
    }
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (user.perfil === role) return true;
    if (user.permissoes) {
      return user.permissoes.includes(role);
    }
    return false;
  };

  const getToken = () => {
    return token || localStorage.getItem(TOKEN_KEY);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};