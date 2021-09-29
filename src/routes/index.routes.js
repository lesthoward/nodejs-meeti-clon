const { Router } = require('express')
const router = Router()
const indexController = require('../controllers/index.controller')

router.get('/', 
    indexController.showHome
)

router.post('/ok', (req, res, next) => {
    req.session.locale = 'es'
    res.setLocale(req.session.locale)
    res.redirect('/')
})


module.exports = router