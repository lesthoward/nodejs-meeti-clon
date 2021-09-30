const { DataTypes, Sequelize } = require('sequelize')
const { v4: uuid } = require('uuid')
const { nanoid } = require('nanoid')
const db = require('../config/db-connection')
const slug = require('slug')
const User = require('./User')
const Group = require('./Group')

const Meeti = db.define('meeti', 
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            lowercase: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            unique: {
                args: true,
                msg: 'Ya existe un meeti con ese nombre'
            }
        },
        guest: DataTypes.STRING,
        spot: {
            type: DataTypes.STRING,
            defaultValue: 0
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        members: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            defaultValue: []
        }
    },
    {
        hooks: {
            beforeCreate(meeti) {
                console.log(meeti);
                const newSlug = slug(meeti.title).toLowerCase()
                meeti.slug = `${newSlug}-${nanoid(5)}`
            }
        }
    }
)

Meeti.belongsTo(User)
Meeti.belongsTo(Group)

module.exports = Meeti