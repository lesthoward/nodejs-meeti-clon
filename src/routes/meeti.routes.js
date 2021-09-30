const { Router } = require('express')
const router = Router()
const { isAuthenticate } = require('../controllers/auth.controller')
const meetiController = require('../controllers/meeti.controller')

router.get('/meeti/new', 
    isAuthenticate,
    meetiController.showForm
)

router.post('/meeti/new', 
    isAuthenticate,
    meetiController.expressValidator,
    meetiController.newMeeti
)

router.get('/meeti/edit/:id', 
    isAuthenticate,
    meetiController.showFormEdit
)

router.post('/meeti/edit/:id', 
    isAuthenticate,
    meetiController.expressValidator,
    meetiController.editMeeti
)

router.get('/meeti/delete/:id', 
    isAuthenticate,
    meetiController.showFormDelete
)

router.post('/meeti/delete/:id', 
    isAuthenticate,
    meetiController.deleteMeeti
)



module.exports = router