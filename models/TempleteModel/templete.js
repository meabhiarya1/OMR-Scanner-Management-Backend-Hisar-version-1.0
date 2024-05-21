const Sequelize = require("sequelize");

const sequelize = require("../../utils/database");

const Templete = sequelize.define("templetes", {
  // id: {
  //   type: Sequelize.INTEGER,
  //   autoIncrement: true,
  //   allowNull: false,
  //   primaryKey: true,
  // },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  TempleteType :{
    type: Sequelize.STRING,
    allowNull: false,
  }
});

module.exports = Templete;
