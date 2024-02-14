const express = require('express')
const app = express()
const path = require('path')
const dbpath = path.join(__dirname, 'todoApplication.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
app.use(express.json())
const hasStatusProperty = getquery => {
  return getquery.status != undefined
}
const hasPriorityProperty = getquery => {
  return getquery.priority != undefined
}
const haspriorityAndStatusProperty = getquery => {
  return getquery.priority != undefined && getquery.status != undefined
}
const hastodo = deets => {
  return deets.todo != undefined
}
const makeserverDbConnection = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(e.message)
  }
}
makeserverDbConnection()
app.get('/todos/', async (request, response) => {
  const getquery = request.query
  let dbquery = ''
  let data = null
  const {status, priority, search_q = ''} = getquery
  switch (true) {
    case hasStatusProperty(getquery):
      dbquery = `select * from todo where todo like "%${search_q}%" and status="${status}"; `
      break
    case hasPriorityProperty(getquery):
      dbquery = `select * from todo where todo like "%${search_q}%" and priority="${priority}"; `
      break
    case haspriorityAndStatusProperty(getquery):
      dbquery = `select * from todo where todo like "%${search_q}%" and priority="${priority} and status="${status};`
      break
    default:
      dbquery = `select * from todo where todo like "%${search_q}%";`
  }
  data = await db.all(dbquery)
  response.send(data)
})
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const dbquery = `select * from todo where id=${todoId};`
  const dbresponse = await db.get(dbquery)
  response.send(dbresponse)
})
app.post('/todos/', async (request, response) => {
  const deets = request.body
  const {id, todo, priority, status} = deets
  const dbquery = `insert into todo (id,todo,priority,status) values (${id},"${todo}","${priority}","${status}");`
  const dbresposne = await db.run(dbquery)
  response.send('Todo Successfully Added')
})
app.put('/todos/:todoId/', async (request, response) => {
  const deets = request.body
  const {todoId} = request.params
  const {todo, priority, status} = deets
  let dbquery = ''
  let data = null
  let col = ''
  switch (true) {
    case hasPriorityProperty(deets):
      dbquery = `update todo set priority="${priority}" where id=${todoId};`
      col = 'Priority'
      break
    case hasStatusProperty(deets):
      dbquery = `update todo set status="${status}" where id=${todoId};`
      col = 'Status'
      break
    case hastodo(deets):
      dbquery = `update todo set todo="${todo}" where id=${todoId};`
      col = 'Todo'
      break
  }
  data = await db.run(dbquery)
  response.send(`${col} Updated`)
})
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const dbquery = `delete from todo where id=${todoId};`
  const dbresponse = await db.run(dbquery)
  response.send('Todo Deleted')
})
module.exports = app
