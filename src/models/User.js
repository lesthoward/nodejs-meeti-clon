const { Sequelize, DataTypes } = require('sequelize')
const db = require('../config/db-connection')
const bcrypt = require('bcrypt')


const User = db.define('user', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(60),
            lowercase: true,
            trim: true,
            validate: {
                is: {
                    args: /^[a-zA-Z]+\s?$/,
                    msg: 'El nombre solo puede contener letras'
                }
            }
        },
        image: DataTypes.STRING(60),
        description: DataTypes.TEXT,
        email: {
            type: DataTypes.STRING(40),
            allowNull: false,
            lowercase: true,
            trim: true,
            validate: {
                isEmail: {msg: 'Ingresa un correo válido'}
            },
            unique: {
                args: true,
                msg: 'El correo ya se encuentra registrado'
            }
        },
        password: {
            type: DataTypes.STRING(80),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Tienes que definir una contraseña'
                },
                is: {
                    args: /(?=.*[a-z])(?=.*[^\w])(?=.*[0-9])/g,
                    msg: 'La contraseña debe contener al menos: 1 letra minúscula, 1 letra mayúscula, 1 carácter especial, 1 dígito'
                }
            }
        },
        isValid: {
            type: DataTypes.STRING,
            defaultValue: null 
        },
        tokenPassword: DataTypes.STRING,
        tokenExpiredDate: DataTypes.DATE
    },
    {
        hooks: {
            beforeCreate(user) {
                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
            }
        }
    }
)

User.prototype.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = User