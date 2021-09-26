const { Sequelize } = require('sequelize')
const sequelizeTransform = require('sequelize-transforms')

const dbConnection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
})
sequelizeTransform(dbConnection)

module.exports = dbConnection