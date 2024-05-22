import { Authenticator } from 'remix-auth';
import { sessionStorage } from '~/auth/session.server';
import { OAuth2Strategy } from 'remix-auth-oauth2';
import jwt, { JwtPayload } from 'jsonwebtoken';

export type Session = {
  accessToken: string;
  refreshToken?: string;
  user?: User;
};

export type User = {
  id: string;
  email: string;
};

export const authenticator = new Authenticator<Session>(sessionStorage);

const getUserFromToken = (idToken: string) => {
  const { traits, sub } = jwt.decode(idToken) as JwtPayload & { traits: { email: string } };
  return { id: sub ?? '', email: traits.email };
};

export const oauth2Strategy = new OAuth2Strategy(
  {
    authorizationEndpoint: 'http://localhost:8444/oauth2/auth',
    tokenEndpoint: 'http://localhost:8444/oauth2/token',
    tokenRevocationEndpoint: 'http://localhost:8444/oauth2/revoke',
    clientId: 'remix-app',
    clientSecret: 'secret',
    redirectURI: 'http://localhost:3000/auth/callback',
    scopes: ['openid', 'offline_access'],
    codeChallengeMethod: 'S256',
    authenticateWith: 'request_body',
  },
  async ({ tokens }) => {
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: getUserFromToken(tokens.id_token),
    };
  },
);

authenticator.use(oauth2Strategy, 'ore-no-idp');
