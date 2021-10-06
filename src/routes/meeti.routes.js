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


// Front-End
router.get('/meeti/:slug', 
    meetiController.showSingleMeeti
)

router.post('/meeti/comment/:id', meetiController.addComment)
router.post('/meeti/delete-comment', meetiController.deleteComment)

router.get('/meeti/assistants/:slug', meetiController.showAssistant)

router.post('/meeti/assistants/:slug', meetiController.newAssistant)

router.get('/meeti/by-category/:category', meetiController.showByCategory)

module.exports = router