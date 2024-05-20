import { LoaderFunctionArgs } from '@remix-run/node';
import { authenticator, Session } from '~/auth/auth.server';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
}

export default function DashboardRoute() {
  const { user } = useLoaderData<Session>();

  return <div>Welcome, {user?.email}!</div>;
}
