// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!initialized) return; // só atualiza depois que o provider estiver pronto

    const updateAuthState = () => {
      const authenticated = keycloak.authenticated || false;
      setIsAuthenticated(authenticated);

      if (authenticated && keycloak.tokenParsed) {
        const userInfo = keycloak.tokenParsed;
        setUser({
          id: userInfo.sub,
          name: userInfo.name || userInfo.preferred_username,
          email: userInfo.email,
          roles: userInfo.realm_access?.roles || [],
          isGestor: userInfo.realm_access?.roles?.includes('gestor') || false
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    updateAuthState();

    keycloak.onAuthSuccess = updateAuthState;
    keycloak.onAuthError = updateAuthState;
    keycloak.onAuthRefreshSuccess = updateAuthState;
    keycloak.onAuthRefreshError = () => keycloak.login();
    keycloak.onAuthLogout = updateAuthState;
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.login());
    };

    return () => {
      keycloak.onAuthSuccess = null;
      keycloak.onAuthError = null;
      keycloak.onAuthRefreshSuccess = null;
      keycloak.onAuthRefreshError = null;
      keycloak.onAuthLogout = null;
      keycloak.onTokenExpired = null;
    };
  }, [keycloak, initialized]);

  const login = () => keycloak?.login();
  const logout = () => keycloak?.logout();
  const hasRole = (role) => keycloak?.hasRealmRole(role);
  const getToken = async () => {
    try {
      await keycloak.updateToken(30);
      return keycloak.token;
    } catch (error) {
      login();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isGestor: user?.isGestor || false,
        login,
        logout,
        hasRole,
        getToken,
        keycloak
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
