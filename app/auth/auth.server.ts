import { Authenticator } from 'remix-auth';
import { sessionStorage } from '~/auth/session.server';
import { OAuth2Profile, OAuth2Strategy } from 'remix-auth-oauth2';
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

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<Session>(sessionStorage);

export async function getUser(profile: OAuth2Profile): Promise<User> {
  const email = profile.emails?.[0]?.value;
  const id = profile.id ?? '';

  return { id, email: email ?? '' };
}

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
    // here you can use the params above to get the user and return it
    // what you do inside this and how you find the user is up to you
    const user = getUserFromToken(tokens.id_token);

    return { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, user };
  },
);

authenticator.use(
  oauth2Strategy,
  // this is optional, but if you setup more than one OAuth2 instance you will
  // need to set a custom name to each one
  'ore-no-idp',
);
