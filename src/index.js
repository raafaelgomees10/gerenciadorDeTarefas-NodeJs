const express = require("express")
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors())
app.use(express.json())

users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((it) => it.username === username)

  if (!user) {
    return response.status(404).json({ error: "User not Found" })
  }

  request.user = user
  return next()
}

//Rota de criação de usuarios
app.post("/users", (request, response) => {
  const { name, username } = request.body

  const verifyUserExists = users.some((user) => user.username === username)

  if (verifyUserExists) {
    return response.status(400).json({ error: "username already exists" })
  }

  const id = uuidv4()

  users.push({
    name,
    username,
    id: uuidv4(),
    todo: [],
  })

  return response.status(201).json(users).send()

})

//rota de visualização dos usuarios
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todo)

})

//rota de criação de tarefas(todo)
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { user } = request;

  user.todo.push({
    id: uuidv4(),
    title,
    done: false,
    created_at: new Date(),
    deadline: new Date(deadline),
  })

  return response.status(201).json(user).send()

})
//rota de alteração do title e deadline
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const id = request.params.id;

  const checkToDoExists = user.todo.find(it => it.id === id)

  if (!checkToDoExists) {
    return response.status(404).json({ error: "To do not found - Put Route" })
  }

  checkToDoExists.title = title
  checkToDoExists.deadline = new Date(deadline)

  return response.status(201).json(user).send()
})
//rota de alteração do status da tarefa(done)
app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { done } = request.body
  const { user } = request
  const id = request.params.id

  const checkToDoExists = user.todo.find(it => it.id === id)

  if (!checkToDoExists) {
    return response.status(404).json({ error: "To do not found - Patch Route" })
  }

  checkToDoExists.done = true


  return response.status(201).json(user).send()
})
//rota de exclusão de tarefa
app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  // for (let i = 0; user.todo.length; i++) {
  //   if (user.todo[i].id === id) {
  //     users.splice(user, 1)
  // }

  const checkToDoExists = user.todo.findIndex(todo => todo.id === id)

  if (checkToDoExists === -1) {
    return response.status(404).json({ error: "To do not found - Delete Route" })
  }

  user.todo.splice(checkToDoExists, 1)

  return response.status(204).json()
})

app.listen(3332)