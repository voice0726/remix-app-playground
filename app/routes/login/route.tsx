import { LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  return authenticator.authenticate('ore-no-idp', request);
}
