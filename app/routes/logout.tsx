import { createCookie, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';
import Crypto from 'crypto';

const logoutStateCookie = createCookie('logout_state', {
  path: '/',
  httpOnly: true,
  maxAge: 60 * 15,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  if (!state) {
    const state = Crypto.randomBytes(20).toString('hex');
    return redirect(
      `http://localhost:8080/oidc/v1/end_session?id_token_hint=${user.idToken}&post_logout_redirect_uri=http://localhost:3000/logout&state=${state}`,
      {
        headers: {
          'Set-Cookie': await logoutStateCookie.serialize({ logoutState: state }),
        },
      },
    );
  }

  const cookie = await logoutStateCookie.parse(request.headers.get('Cookie')) as { logoutState: string };
  if (state !== cookie.logoutState) {
    throw new Error('Invalid state');
  }

  return await authenticator.logout(request, { redirectTo: '/login' });
}
