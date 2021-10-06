const { Router } = require('express')
const { isAuthenticate } = require('../controllers/auth.controller')
const router = Router()
const userController = require('../controllers/user.controller')
const multerSingle = require('../handlers/shared')

router.get('/user/edit', 
    isAuthenticate,
    userController.showProfile
)

router.post('/user/edit', 
    isAuthenticate,
    userController.editProfile
)

router.get('/user/password-changing',
    isAuthenticate,
    userController.showPasswordChanging
)

router.post('/user/password-changing',
    isAuthenticate,
    userController.changePassword
)

router.get('/user/image',
    isAuthenticate,
    userController.showFormImage 
)


router.post('/user/image',
    isAuthenticate,
    (req, res, next) => multerSingle(req, res, next, 'profile', /(jpg|png|jpeg)$/),
    userController.editImage
)

router.get('/user/logout',
    isAuthenticate,
    userController.logout
)


// FRONT-END
router.get('/user/profile/:id', 
    userController.showUserProfile
)

module.exports = router