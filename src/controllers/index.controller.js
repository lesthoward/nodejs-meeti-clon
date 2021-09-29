const { request, response } = require('express')


const showHome = (req=request, res=response, next) => {
    res.render('homepage', {
        title: 'Bienvenido: ' + res.__('Greeting')
    })
}

module.exports = {
    showHome
}