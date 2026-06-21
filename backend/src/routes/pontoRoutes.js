// src/routes/pontoRoutes.js
const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');

// GET para listar, POST para criar
router.get('/', pontoController.getPontos);
router.post('/', pontoController.createPonto);

module.exports = router;
