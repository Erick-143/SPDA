const express = require('express');
const router = express.Router();
const { listarClientes, criarCliente, excluirCliente, listarClientesInativos, reativarCliente } = require('../controllers/clienteController');

router.get('/', listarClientes);
router.get('/inativos', listarClientesInativos); // NOVA: Busca inativos
router.post('/', criarCliente);
router.delete('/:id', excluirCliente);
router.put('/:id/reativar', reativarCliente); // NOVA: Reativa o cliente

module.exports = router;
