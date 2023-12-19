const express = require('express');

const UserController = require('./src/controllers/UserController');
const CadastreVeiclesController = require('./src/controllers/CadastreVeiclesController')

const routes = express.Router();

//USERS  UserController
routes.get('/LoginUser/:name', UserController.index);
routes.post('/LoginUser', UserController.store);
routes.post('/SignupUser', UserController.storeCadastre);


//CadastreVeiclesController
routes.get('/CadastreVeicles', CadastreVeiclesController.index);
routes.get('/CadastreVeicles/:id', CadastreVeiclesController.Satusindex);
routes.put('/VeiclesUpdate/:id', CadastreVeiclesController.update);
routes.put('/VeiclesUpdateStatus/:id', CadastreVeiclesController.Statusupdate);
routes.delete('/DeleteVeicles/:id', CadastreVeiclesController.delete);
routes.get('/CadastreVeiclesTemp', CadastreVeiclesController.temp);
routes.post('/CadastreVeicles', CadastreVeiclesController.store);


module.exports = routes;