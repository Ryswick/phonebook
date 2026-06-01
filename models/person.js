const mongoose = require('mongoose')

const URL = process.env.MONGODB_URI;

mongoose.set('strictQuery', false)
mongoose.connect(URL, {family: 4})
    .then(result => 
    {
        console.log('Connected to MongoDB')
    })
    .catch(error =>
    {
        console.log('Error connecting to MongoDB', error.message);
    })

const personSchema = new mongoose.Schema({
    name: 
    {
        type: String,
        required: [true, 'Name is required'],
        minLength: [3, 'Name must be at least 3 characters long']
    },
    number: 
    {
        type: String,
        required: [true, 'A phone number is required'],
        minLength: [8, 'A valid phone number should at least include 8 numbers'],
        validate: {
            validator: function(v) {
                return /^\d{2,3}-\d+$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number. Format must be: XX-XXXXXXX (2 digits, hyphen, numbers) or XXX-XXXXXXXX (3 digits, hyphen, numbers). Example: 09-1234567 or 040-12345678`
        }
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.__v
        delete returnedObject._id
    }
})

module.exports = mongoose.model('Person', personSchema);