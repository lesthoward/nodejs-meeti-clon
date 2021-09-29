const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/User')
const RememberMeStrategy = require('passport-remember-me-extended').Strategy

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        const user = await User.findOne({where: { 
            email: email.trim()
        }})
        if(!user) return done(null, false, { message: 'Ingrese un correo registrado' })

        if(!user.checkPassword(password)) return done(null, false, { message: 'Contraseña incorrecta' })
        
        if(user.isValid === '1') {
            done(null, user)

        } else {
            done(null, false, {message: 'Primero tienes que confirmar el correo'})
        }
    }
))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (userID, done) => {
    const user = await User.findByPk(userID)
    done(null, user)
    'successfully'
})

module.exports = passport