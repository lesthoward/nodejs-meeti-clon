const { DataTypes } = require('sequelize')
const db = require('../config/db-connection')

const Category = db.define('category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.TEXT
})

module.exports = Category