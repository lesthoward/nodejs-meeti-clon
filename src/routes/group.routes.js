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
    groupController.uploadImage,
    groupController.createGroup,
)

router.get('/group/edit/:groupID', 
    isAuthenticate,
    groupController.showEdit
)

router.post('/group/edit/:groupID', 
    isAuthenticate,
    groupController.editGroup
)

router.get('/group/edit-image/:groupID',
    isAuthenticate,
    groupController.showEditImage
)
router.post('/group/edit-image/:groupID',
    isAuthenticate,
    groupController.uploadImage,
    groupController.editImage
)

module.exports = router