'use strict'

const Sequelize = require('sequelize');
const sequelize = new Sequelize('modal-rakyat', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.kurs = require('../models/kurs.js')(sequelize, Sequelize);

module.exports = db;