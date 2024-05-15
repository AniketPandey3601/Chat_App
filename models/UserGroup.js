const { DataTypes } = require('sequelize');
const sequelize = require('../models/index');

const UserGroup = sequelize.define('UserGroup', {
    userId: {
        type: DataTypes.INTEGER,
        // primaryKey: true, // Ensure userId is a primary key
        allowNull: false
    },
    groupId: {
        type: DataTypes.INTEGER,
        // primaryKey: true, // Ensure groupId is a primary key
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
});

module.exports = UserGroup;