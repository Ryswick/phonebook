require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const person = require('./models/person')

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

app.get('/api/persons', (request, response, next) =>
{
  Person.find({})
    .then(people =>{
      response.json(people);
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) =>
{
  Person.findById(request.params.id)
    .then(person =>
    {
      if(person)
        response.json(person)
      else
        response.status(404).end()
      }
    )
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) =>
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

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save()
    .then(addedPerson =>
    {
      return response.json(addedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) =>
{
  Person.findById(request.params.id)
    .then(person => 
    {
      if(!person)
        return response.status(404).end()

      person.number = request.body.number;

      return person.save()
        .then(updatedPerson => 
        {
          return response.json(updatedPerson)
        })
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) =>
{
  Person.findByIdAndDelete(request.params.id)
    .then(deletedPerson => {
      response.status(204).end();
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) =>
{
  Person.find({})
    .then(people =>{
      response.send(`<p>Phonebook has info for ${people.length} people.</p>
                 <p>${new Date()}</p>`)
    })
    .catch(error => next(error))
  
})

const errorHandler = (error, request, response, next) => {
  console.error(error.name, '|', error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id'})
  }
  else if(error.name ==='ValidationError'){
    const firstError = Object.values(error.errors)[0].message
    return response.status(400).send({ error: firstError })
  }

  next(error)
}

app.use(errorHandler)


const PORT= process.env.PORT || 3001
app.listen(PORT, () =>
console.log(`Server running on port ${PORT}`))