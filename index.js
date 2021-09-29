const express = require('express')
const app = express()
const port = process.env.PORT || 8000
const path = require('path')
const livereload = require('livereload')
const connectReload = require('connect-livereload')
require('dotenv').config()
// Functional imports
const expressLayouts = require('express-ejs-layouts')
const dbConnection = require('./src/config/db-connection')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('./src/config/passport')
const { request, response } = require('express')


// Database connection
try {
    require('./src/models/User')
    require('./src/models/Category')
    require('./src/models/Group')
    dbConnection.sync({alter: true})
    .then(() => {
        console.log('Postgres connection has been established successfully');
    })
    // Models
} catch (error) {
    console.log('Error to connect database');
}

// Live reload
const liveReloadServer = livereload.createServer()
liveReloadServer.watch(path.join(__dirname, './public/'))
liveReloadServer.server.once('connection', () => {
    setTimeout(function() {
        liveReloadServer.refresh('/')
    }, 100);
})
app.use(connectReload())

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// View engine (EJS)
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './src/views'))
app.set('layout', 'layouts/main')

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        // expires: new Date(Date.now() + 60 * 10000), 
        // maxAge: 60*10000
      }
}))
app.use(flash())
// Passport
app.use(passport.initialize())
app.use(passport.session())
// Lang
const { I18n, setLocale } = require('i18n')
const i18n = new I18n()

i18n.configure ({
    directory: path.join(__dirname, './src/locals'),
    locales: ['en', 'es'],
    header: ['accept-language']
})

app.use((req, res, next) => {
    i18n.init(req, res)
    if(req.session.locale) res.setLocale(req.session.locale)
    next()
})


// Personal middlewares
app.use((req, res, next) => {
    const user = {
        id: 29,
        email: 'lesthoward@gmail.com',
        password: '$2b$10$.iK5ZdqArydFeOhu157B4eDlZQ.tCy742RRfIrjH16j6pWn6t.P9C',

    }
    req.logIn(user, function(err) {
        if(err) return res.send('Error Auth')

        console.log('Ok, logged');
    })

    res.locals.messages = req.flash()
    res.locals.year = new Date()
    next() 
})

// Routes
app.use('/', require('./src/routes/index.routes'))
app.use('/', require('./src/routes/auth.routes'))
app.use('/', require('./src/routes/management.routes'))
app.use('/', require('./src/routes/group.routes'))



app.listen(port, () => {
    console.log('Server on port', port);
})