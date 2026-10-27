const express = require('express');
const router = express.Router();
const auxiliarController = require('../controllers/auxiliarController');

router.get('/dados-cadastro', auxiliarController.getDadosCadastro);

module.exports = router;
