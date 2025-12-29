import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: 'https://auth-dmr-inss.gov.st',
  realm: 'UCID-STP',
  clientId: 'frontend-ucid'
});

export default keycloak;
