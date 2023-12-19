//conexão com base de dados
const Sequelize = require('sequelize');
const db = require('../config/dataBase');

const User= require('../models/User');
const CadastreVeicles=require('../models/CadastreVeicles');

const connection = new Sequelize(db);

User.init(connection);
CadastreVeicles.init(connection);


module.exports = connection;