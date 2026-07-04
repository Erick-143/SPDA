const express = require('express');
const router = express.Router();
const { listarAreas, criarArea, excluirArea, calcularImpactoArea, listarAreasInativas, reativarArea } = require('../controllers/areaController');

router.get('/', listarAreas);
router.get('/inativos', listarAreasInativas);
router.get('/:id/impacto', calcularImpactoArea);
router.post('/', criarArea);
router.delete('/:id', excluirArea);
router.put('/:id/reativar', reativarArea);

module.exports = router;
