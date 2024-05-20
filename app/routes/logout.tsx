import { ActionFunctionArgs } from '@remix-run/node';
import { authenticator, oauth2Strategy } from '~/auth/auth.server';

export async function loader({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  await oauth2Strategy.revokeToken(user.accessToken);
  return await authenticator.logout(request, { redirectTo: '/login' });
}
