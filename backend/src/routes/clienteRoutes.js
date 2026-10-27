const express = require('express');
const router = express.Router();
const { listarClientes, criarCliente, excluirCliente, listarClientesInativos, reativarCliente, calcularImpactoCliente } = require('../controllers/clienteController');
router.get('/', listarClientes);
router.get('/inativos', listarClientesInativos);
router.get('/:id/impacto', calcularImpactoCliente); // NOVA: Rota de análise de impacto
router.post('/', criarCliente);
router.delete('/:id', excluirCliente);
router.put('/:id/reativar', reativarCliente);

module.exports = router;