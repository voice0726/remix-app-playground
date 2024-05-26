import { json, LoaderFunctionArgs } from '@remix-run/node';
import { checkSession } from '~/auth/auth.server';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id || Number.isNaN(Number(id))) {
    throw new Response('Todo not found', { status: 404 });
  }
  const { session, headers } = await checkSession(request);
  const res = await fetch(`http://localhost:8000/todos/${id}`, {
    headers: { authorization: `Bearer: ${session.accessToken}` },
  }).then(async (res) => {
    switch (res.status) {
      case 200:
        return await res.json();
      case 401:
        console.log('Unauthorized');
        throw new Response('Unauthorized', { status: 401 });
      case 404:
        console.log('Todo not found');
        throw new Response('Todo not found', { status: 404 });
      default:
        throw new Error('Failed to fetch todo');
    }
  });

  return json({ todo: res }, { headers });
}

export default function DashboardRoute() {
  const { todo } = useLoaderData<typeof loader>();

  console.log(todo);

  return (
    <div className="text-xs">
      <h1 className="text-2xl">Todo</h1>
      <div key={todo.id}>{todo.title}</div>
    </div>
  );
}
