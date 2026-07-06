// src/routes/inspecaoRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const inspecaoController = require('../controllers/inspecaoController');

const upload = multer({ dest: 'uploads/' });

// POST para cadastrar o laudo
router.post('/', upload.single('foto'), inspecaoController.createInspecao);

// GET para trazer a Ficha Digital do Ponto (Ex: /api/inspecoes/ponto/1)
router.get('/ponto/:ponto_id', inspecaoController.getInspecoesPorPonto);

module.exports = router;
