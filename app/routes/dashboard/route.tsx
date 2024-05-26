import { LoaderFunctionArgs } from '@remix-run/node';
import { checkSession } from '~/auth/auth.server';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  return await checkSession(request);
}

export default function DashboardRoute() {
  const { session } = useLoaderData<typeof loader>();

  return (
    <div className="text-xs">
      <h1 className="text-2xl">Welcome, {session.user?.email}!</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
