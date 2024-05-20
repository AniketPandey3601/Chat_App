const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./index');

const ArchivedGroupMessage = sequelize.define('ArchivedGroupMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    
});

module.exports = ArchivedGroupMessage;