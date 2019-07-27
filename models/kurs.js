'use strict';
module.exports = (sequelize, DataTypes) => {
  const kurs = sequelize.define('kurs', {
    currency: DataTypes.STRING,
    eRateBuy: DataTypes.STRING,
    eRateSell: DataTypes.STRING,
    ttCounterBuy: DataTypes.STRING,
    ttCounterSell: DataTypes.STRING,
    bankNotesBuy: DataTypes.STRING,
    bankNotesSell : DataTypes.STRING,
    date: DataTypes.STRING
  }, {});
  kurs.associate = function(models) {
    // associations can be defined here
  };
  return kurs;
};