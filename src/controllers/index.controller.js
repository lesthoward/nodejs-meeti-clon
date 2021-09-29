const { request, response } = require('express')


const showHome = (req=request, res=response, next) => {
    res.render('homepage', {
        title: 'Bienvenido: '
    })
}

module.exports = {
    showHome
}