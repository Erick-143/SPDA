// src/routes/inspecaoRoutes.js
const express = require('express');
const router = express.Router();
const inspecaoController = require('../controllers/inspecaoController');

// POST para cadastrar o laudo
router.post('/', inspecaoController.createInspecao);

// GET para trazer a Ficha Digital do Ponto (Ex: /api/inspecoes/ponto/1)
router.get('/ponto/:ponto_id', inspecaoController.getInspecoesPorPonto);

module.exports = router;
