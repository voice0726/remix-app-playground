import { authenticator } from '~/auth/auth.server';
import { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async ({ request }) => {
  return await authenticator.authenticate('ore-no-idp', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  });
};
