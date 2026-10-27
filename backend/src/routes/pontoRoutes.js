const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');

// GET para listar, POST para criar
router.get('/inativos', pontoController.listarPontosInativos); 
router.get('/', pontoController.getPontos);
router.post('/', pontoController.createPonto);
router.get('/buscar-codigo/:codigo', pontoController.buscarPorCodigo);
router.put('/:id/inativar', pontoController.inativarPonto);
router.put('/:id/reativar', pontoController.reativarPonto);

module.exports = router; 