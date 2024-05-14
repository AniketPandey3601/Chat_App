const { Sequelize, DataTypes } = require('sequelize');
const UserGroup = require('./UserGroup')
const sequelize = require('./index')

const Group = sequelize.define('group', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    }




  });
  
  module.exports = Group;