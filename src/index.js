const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    response.status(404).send(new Error('ERRO'));
  }
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);

  return response.send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const todos = users.find((user) => user.username === username).todos;

  return response.send(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const user = users.find((user) => user.username === username);
  const { todos } = user;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  todos.push(todo);
  response.status(201);
  return response.send(todo);
});

app.put('/todos/:id', (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const todos = users.find((user) => user.username === username).todos;
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: 'Not Found' });
  }
  todo.deadline = deadline;
  todo.title = title;
  return response.send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const todos = users.find((user) => user.username === username).todos;
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: 'Not Found' });
  }
  todo.done = true;
  return response.send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = users.find((user) => user.username === request.headers.username);
  const todoToDelete = user.todos.findIndex((todo) => todo.id === id);
  if (todoToDelete < 0) {
    return response.status(404).send({ error: 'Not Found' });
  }
  user.todos.splice(todoToDelete, 1);
  return response.status(204).send();
});

module.exports = app;
