const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./index')

const messages = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    }
});


module.exports = messages;