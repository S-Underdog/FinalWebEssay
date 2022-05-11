const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT
const handlebars = require('express-handlebars')
const database = require('./config/db')



// View engine
app.set('view engine', 'hbs')
app.engine('hbs', handlebars.engine({
    extname: 'hbs'
}))



app.get('/', (req, res) => {
    res.render('register')
})

// Connect to Data base
database.connect()
    .then(
        app.listen(port, () => console.log('Server started'))
    )