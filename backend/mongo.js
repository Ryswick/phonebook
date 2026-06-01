const mongoose = require('mongoose')

if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log('Format:\nnode mongo.js <password>: Lists all the contacts available in the phonebook.\nnode mongo.js <password> <name> <phone_number>: Adds the following user and number pair in the phonebook.')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb://romain_db_user:${password}@ac-hvf43c4-shard-00-00.jn4bbfi.mongodb.net:27017,ac-hvf43c4-shard-00-01.jn4bbfi.mongodb.net:27017,ac-hvf43c4-shard-00-02.jn4bbfi.mongodb.net:27017/phonebook?ssl=true&replicaSet=atlas-coylat-shard-0&authSource=admin&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url, {family: 4})

const personSchema = mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema);

// List all phonebook people
if(process.argv.length === 3)
{
    Person.find({}).then(result =>
    {
        console.log("phonebook")
        result.forEach(person =>{
            console.log(person.name, person.number);
        })
        mongoose.connection.close();
    })
    
}
// Add a person to the phonebook
else if(process.argv.length === 5)
{
    const name = process.argv[3];
    const number = process.argv[4];

    const person = new Person({
        name,
        number
    })

    person.save().then(result =>
    {
        console.log(`added ${result.name} number ${result.number} to phonebook`);
        mongoose.connection.close();
    })
}