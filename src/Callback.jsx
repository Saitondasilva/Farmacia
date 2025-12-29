import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

export default function KeycloakCallback() {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [initialized, keycloak, navigate]);

  return <div>Processando login...</div>;
}
