const { Router } = require('express')
const router = Router()
const managementController = require('../controllers/management.controller')
const { isAuthenticate, preserveLogin, goAuthenticate } = require('../controllers/auth.controller')


router.get('/management',
    isAuthenticate,
    managementController.showPanel
)

module.exports = router
