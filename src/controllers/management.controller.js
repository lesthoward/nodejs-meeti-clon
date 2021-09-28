const { request, response } = require('express')
const Group = require('../models/Group')

const showPanel  = async (req=request, res=response) => {
    const groups = await Group.findAll({
        where: { userId: req.user.id },
        order: [
            ['createdAt', 'ASC']
        ]
    })

    res.render('management-panel', {
        title: 'Panel de administración',
        groups
    })
}

module.exports = {
    showPanel
}