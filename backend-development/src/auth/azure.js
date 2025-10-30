// src/auth/azure.js
const msal = require('@azure/msal-node');

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

// Scopes dasar OIDC + Graph (opsional User.Read utk ambil profil/email bila perlu)
const SCOPES = ['openid', 'profile', 'email', 'offline_access', 'User.Read'];

async function getAuthCodeUrl() {
  return cca.getAuthCodeUrl({
    scopes: SCOPES,
    redirectUri: process.env.AZURE_REDIRECT_URI,
    prompt: 'select_account',
    responseMode: 'query' // callback GET ?code=...
  });
}

async function acquireTokenByCode(code) {
  return cca.acquireTokenByCode({
    code,
    scopes: SCOPES,
    redirectUri: process.env.AZURE_REDIRECT_URI
  });
}

module.exports = { cca, getAuthCodeUrl, acquireTokenByCode, SCOPES };
