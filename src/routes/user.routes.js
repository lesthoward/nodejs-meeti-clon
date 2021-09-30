const { Router } = require('express')
const { isAuthenticate } = require('../controllers/auth.controller')
const router = Router()
const userController = require('../controllers/user.controller')


router.get('/user/edit', 
    isAuthenticate,
    userController.showProfile
)

router.post('/user/edit', 
    isAuthenticate,
    userController.editProfile
)

module.exports = router