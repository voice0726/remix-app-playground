import { json, LoaderFunctionArgs } from '@remix-run/node';
import { checkSession } from '~/auth/auth.server';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, headers } = await checkSession(request);
  const res = await fetch(`http://localhost:8000/todos`, {
    headers: { authorization: `Bearer: ${session.accessToken}` },
  }).then(async (res) => {
    if (res.status === 200) {
      return await res.json();
    }
    throw new Error('Failed to fetch todos');
  });

  return json({ todos: res }, { headers });
}

export default function DashboardRoute() {
  const { todos } = useLoaderData<typeof loader>();

  return (
    <div className="text-sm">
      <h1 className="text-2xl">Todos</h1>
      {todos.map((todo: any) => (
        <div key={todo.id}>
          {todo.id}: {todo.title} - {todo.description}
        </div>
      ))}
    </div>
  );
}
