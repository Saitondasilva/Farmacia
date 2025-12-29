// src/hooks/useAuth.js
import { useKeycloak } from '@react-keycloak/web';

export const useAuth = () => {
  const { keycloak, initialized } = useKeycloak();

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout();
  };

  const register = () => {
    keycloak.register();
  };

  const hasRole = (role) => {
    return keycloak.hasRealmRole(role);
  };

  const getToken = async () => {
    try {
      await keycloak.updateToken(30); // Renova se expirar em menos de 30s
      return keycloak.token;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return null;
    }
  };

  return {
    isAuthenticated: keycloak.authenticated,
    isLoading: !initialized,
    userInfo: keycloak.tokenParsed,
    login,
    logout,
    register,
    hasRole,
    getToken,
    keycloak
  };
};