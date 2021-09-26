const { Router } = require('express')
const router = Router()
const authController = require('../controllers/auth.controller')
const passport = require('passport')


router.get('/register', authController.showRegister)
router.post('/register', authController.addUser)
router.get('/login', authController.showLogin)
router.post('/login',  
// passport.authenticate('local', {
//     failureRedirect: '/login',
//     badRequestMessage: 'Introduce tus datos en los correspondientes',
//     failureFlash: true,
//     }), function(req, res) {
//         res.redirect('ok')
//     },
    [authController.preserveLogin.isFailure, authController.preserveLogin.isOK],
    authController.goAuthenticate
)


router.get('/auth/isValid/:url', authController.accountConfirmation)

module.exports = router