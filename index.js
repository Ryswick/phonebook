const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan((tokens, request, response) =>
{
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    (request.method === "POST")?
    JSON.stringify(request.body)
    :""
  ].join(' ')
}))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) =>
{
  response.json(persons);
})

app.get('/api/persons/:id', (request, response) =>
{
  const id = request.params.id;

  const person = persons.find(person => person.id === id);

  if(person)
    response.json(person);
  else
    return response.status(404).end();
})

const generateId = () =>
{
  const maxId = persons.length > 0?
  Math.max(...persons.map(person => Number(person.id)))
  :0;

  return String(maxId + 1);
}

app.post('/api/persons', (request, response) =>
{
  const body = request.body;

  if(!body.name)
  {
    return response.status(400).json({
      error: "Name is missing"
    })
  }

  if(!body.number)
  {
    return response.status(400).json({
      error: "Number is missing"
    })
  }

  const double = persons.find(person => person.name === body.name);

  if(double)
  {
    return response.status(400).json({
        error: "Name must be unique"
      }
    )
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  morgan.token('data', function (req, res) { return JSON.stringify(person) })

  return response.json(person)
})

app.delete('/api/persons/:id', (request, response) =>
{
  const id = request.params.id;

  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
})

app.get('/info', (request, response) =>
{
  response.send(`<p>Phonebook has info for ${persons.length} people.</p>
                 <p>${new Date()}</p>`)
})


const PORT= process.env.PORT || 3001
app.listen(PORT, () =>
console.log(`Server running on port ${PORT}`))