// src/routes/areaRoutes.js
const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');

// Quando acessarem essa rota com o método GET, rodamos a função getAreas
router.get('/', areaController.getAreas);

module.exports = router;
