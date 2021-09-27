const { request, response } = require('express')
const Category = require('../models/Category')
const Group = require('../models/Group')

const showFormGroup = async (req=request, res=response) => {
    const categories = await Category.findAll()

    res.render('form-group', {
        title: 'Crear un nuevo grupo',
        categories
    })
}


const createGroup = async (req=request, res=response) => {
    const group = req.body

    try {
        await Group.create({
            ...group,
            userId: req.user.id
        })
        
        res.redirect('/management')
    } catch (error) {
        if(error.errors) {
            const errArr = error.errors.map(err => err.message)
            req.flash('errors', errArr)
        }
        res.redirect(req.originalUrl)
    }
}

module.exports = {
    showFormGroup,
    createGroup
}