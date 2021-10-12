const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const {username} = request.headers;
  const user = users.find((user) => user.username === username);

  if(!user){
      return response.status(400).json({error:'User not found!'});
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {

  const {username, name} = request.body;

  if(users.some((user) => user.username === username)){
    return response.status(400).json({error:'Username alredy exists!'});
  }

  const user = {
    id: uuidv4(),
    username: username,
    name:name,
    todos:[]
  }

  users.push(user);

  return response.status(201).json(user);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const {user} = request;
  const {title, deadline} = request.body;

  const todo = {
    id:uuidv4(),
    done:false,
    title,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.query;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status((404)).json({error:"todo not exists!"});
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json({todo});

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  const {id, done} = request.query;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status((404)).json({error:"todo not exists!"});
  }

  todo.done = done;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  const {id} = request.query;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status((404)).json({error:"todo not exists!"});
  }

  user.todos.splice(todo, 1);

  return response.status(200).json(user.todo);
});

module.exports = app;

app.listen(3030);