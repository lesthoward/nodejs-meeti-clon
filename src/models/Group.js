const { DataTypes } = require('sequelize')
const db = require('../config/db-connection')
const { v4: uuid } = require('uuid')
const Category = require('./Category')
const User = require('./User')

const Group = db.define('group', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        // allowNull: false,
        // defaultValue: uuid()
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El grupo debe de tener un nombre'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Coloca una descripción' }
        }
    },
    url: DataTypes.TEXT,
    image: DataTypes.TEXT

})

Group.belongsTo(Category)
Group.belongsTo(User)

module.exports = Group