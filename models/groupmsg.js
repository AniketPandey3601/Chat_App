const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./index')

const GroupMessage = sequelize.define('GroupMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

module.exports = GroupMessage;