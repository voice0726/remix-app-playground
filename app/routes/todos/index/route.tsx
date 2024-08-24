import { json, LoaderFunctionArgs } from '@remix-run/node';
import { checkSession } from '~/auth/auth.server';
import { useLoaderData } from '@remix-run/react';
import { Todo } from '~/types';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, headers } = await checkSession(request);
  const res = await fetch(`http://localhost:8000/todos`, {
    headers: { authorization: `Bearer: ${session.accessToken}` },
  }).then(async (res) => {
    if (res.status === 200) {
      return (await res.json()) as Todo[];
    }
    throw new Error('Failed to fetch todos');
  });

  return json({ todos: res }, { headers });
}

const columnHelper = createColumnHelper<Todo>();
const columns = [
  columnHelper.accessor('id', {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('title', {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('description', {
    cell: (info) => info.getValue(),
  }),
];

export default function DashboardRoute() {
  const { todos } = useLoaderData<typeof loader>();
  const table = useReactTable<Todo>({
    columns,
    data: todos,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="text-sm">
      <h1>React table</h1>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border bg-gray-400">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
