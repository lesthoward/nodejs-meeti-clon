const { Router } = require('express')
const router = Router()
const authController = require('../controllers/auth.controller')

router.get('/register', authController.showRegister)
router.post('/register', authController.addUser)
router.get('/login', authController.showLogin)
router.post('/login', authController.preserveTheLogin)

router.get('/auth/isValid/:url', authController.accountConfirmation)

module.exports = router