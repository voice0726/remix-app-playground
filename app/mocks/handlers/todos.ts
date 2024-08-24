import { http, HttpResponse } from 'msw';

import { data } from './data';

const APP_HOST = 'http://localhost:8000';

export const todoHandlers = [
  http.get(`${APP_HOST}/todos`, () => {
    return HttpResponse.json(data);
  }),
  http.get(`${APP_HOST}/todos/:id`, ({ params }) => {
    const { id } = params;
    const todo = data.find((todo) => todo.id === Number(id));

    if (!todo) {
      return new Response('Not found', { status: 404 });
    }

    return HttpResponse.json(todo);
  }),
];
