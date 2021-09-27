const { request, response } = require('express')


const showPanel  = (req=request, res=response) => {
    
    res.render('management-panel', {
        title: 'Panel de administración'
    })
}

module.exports = {
    showPanel
}