const express = require('express');
const router = express.Router();
const { listarTipos, criarTipo, excluirTipo, calcularImpactoTipo, listarTiposInativos, reativarTipo } = require('../controllers/tipoPontoController');

router.get('/', listarTipos);
router.get('/inativos', listarTiposInativos);
router.get('/:id/impacto', calcularImpactoTipo);
router.post('/', criarTipo);
router.delete('/:id', excluirTipo);
router.put('/:id/reativar', reativarTipo);

module.exports = router;
