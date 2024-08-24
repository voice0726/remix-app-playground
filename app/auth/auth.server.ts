import { Authenticator } from 'remix-auth';
import { commitSession, getSession, sessionStorage } from '~/auth/session.server';
import { OAuth2Strategy } from 'remix-auth-oauth2';
import jwt, { JwtPayload } from 'jsonwebtoken';

export type Session = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  user?: User;
};

export type User = {
  id: string;
  email: string;
};

export const authenticator = new Authenticator<Session>(sessionStorage, { sessionKey: 'session' });

const getUserFromToken = (idToken: string) => {
  const { email, sub } = jwt.decode(idToken) as JwtPayload & { email: string };

  return { id: sub ?? '', email };
};

export const oauth2Strategy = new OAuth2Strategy(
  {
    authorizationEndpoint: process.env.AUTHORIZATION_ENDPOINT_URL ?? '',
    tokenEndpoint: process.env.TOKEN_ENDPOINT_URL ?? '',
    tokenRevocationEndpoint: process.env.TOKEN_REVOCATION_ENDPOINT_URL ?? '',
    clientId: '281641775037218818',
    clientSecret: '',
    redirectURI: process.env.AUTH_CALLBACK_URL ?? '',
    scopes: ['openid', 'email', 'offline_access'],
    codeChallengeMethod: 'S256',
    authenticateWith: 'request_body',
  },
  async ({ tokens }) => {
    return {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      user: getUserFromToken(tokens.id_token),
    };
  },
);

authenticator.use(oauth2Strategy, 'ore-no-idp');

export const checkSession = async (request: Request): Promise<{ session: Session; headers?: HeadersInit }> => {
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const res = await fetch(process.env.USERINFO_ENDPOINT_URL ?? '', {
    headers: { authorization: `Bearer ${session.accessToken}` },
  });
  if (res.status === 401) {
    if (!session.refreshToken) {
      console.log('no refresh token, redirect to login');
      return await authenticator.logout(request, { redirectTo: '/login' });
    }

    const { access_token, refresh_token } = await oauth2Strategy.refreshToken(session.refreshToken);
    console.log('current tokens', session.accessToken, session.refreshToken);
    console.log('refreshed tokens', access_token, refresh_token);

    const s = await getSession(request.headers.get('Cookie'));
    s.set(authenticator.sessionKey, {
      ...s.get(authenticator.sessionKey),
      accessToken: access_token,
      refreshToken: refresh_token,
    });
    session.refreshToken = refresh_token;
    session.accessToken = access_token;

    return { session, headers: { 'Set-Cookie': await commitSession(s) } };
  }
  return { session };
};
