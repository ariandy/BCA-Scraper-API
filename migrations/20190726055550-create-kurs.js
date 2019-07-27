'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('kurs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      currency: {
        type: Sequelize.STRING
      },
      eRateBuy: {
        type: Sequelize.STRING
      },
      eRateSell: {
        type: Sequelize.STRING
      },
      ttCounterBuy: {
        type: Sequelize.STRING
      },
      ttCounterSell: {
        type: Sequelize.STRING
      },
      bankNotesBuy: {
        type: Sequelize.STRING
      },
      bankNotesSell: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('kurs');
  }
};