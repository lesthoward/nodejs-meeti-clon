const { Router } = require('express')
const router = Router()
const groupController = require('../controllers/group.controller')
const { isAuthenticate } = require('../controllers/auth.controller')

router.get('/group/new', 
    isAuthenticate,
    groupController.showFormGroup
)

router.post('/group/new',
    isAuthenticate,
    groupController.createGroup
)

module.exports = router