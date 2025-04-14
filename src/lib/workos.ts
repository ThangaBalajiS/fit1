import { WorkOS } from '@workos-inc/node';

if (!process.env.WORKOS_API_KEY) {
  throw new Error('WorkOS API key is not defined');
}

if (!process.env.WORKOS_CLIENT_ID) {
  throw new Error('WorkOS Client ID is not defined');
}

/* if (!process.env.WORKOS_ORGANIZATION_ID) {
  throw new Error('WorkOS Organization ID is not defined');
} */

// Ensure NEXTAUTH_URL is set and use it for the redirect URI
if (!process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_URL is not defined');
}

export const workos = new WorkOS(process.env.WORKOS_API_KEY);
export const clientId = process.env.WORKOS_CLIENT_ID;
export const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/workos`;

export const getAuthorizationUrl = () => {
  return workos.userManagement.getAuthorizationUrl({
    clientId,
    redirectUri,
    provider: 'authkit',
  });
}; 