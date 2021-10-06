const { Sequelize } = require('sequelize')
const sequelizeTransform = require('sequelize-transforms')
const pg = require('pg');
pg.defaults.ssl = true;


const dbConnection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    
})
sequelizeTransform(dbConnection)
module.exports = dbConnection

require('../models/User')
require('../models/Category')
require('../models/Group')
require('../models/Meeti')
require('../models/Comment')