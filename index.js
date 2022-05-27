const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT
const handlebars = require('express-handlebars')
const flash = require('express-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const database = require('./config/db')
// Import router
const UserRouter = require('./routers/UserRouter')

// View engine
app.set('view engine', 'hbs')
app.engine('hbs', handlebars.engine({
    extname: 'hbs'
}))

// Session & Cookie
app.use(cookieParser('tkh'))
app.use(session({
    cookie: { maxAge: 60000 }, 
    secret: 'knd',
    resave: false, 
    saveUninitialized: false})
);
app.use(flash())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))
// Send dirname
app.use((req, res, next) => {
    req.vars = { root: __dirname }
    next()
})

app.get('/', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/user/login')
    }
    res.render('index')
})

// User Router
app.use('/user', UserRouter)

// Connect to Data base
database.connect()
    .then(
        app.listen(port, () => console.log('Server started'))
    )