const { DataTypes } = require('sequelize')
const db = require('../config/db-connection')
const Meeti = require('./Meeti')
const User = require('./User')

const Comment = db.define('comment', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        message: DataTypes.TEXT
    },
    {
        timestamps: false
    }
)

Comment.belongsTo(User)
Comment.belongsTo(Meeti)
module.exports = Comment
