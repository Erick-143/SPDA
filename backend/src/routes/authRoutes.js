const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define as 3 portas de entrada
router.post('/login-google', authController.loginGoogle);
router.post('/login-tradicional', authController.loginTradicional);
router.post('/criar-senha', authController.criarSenha);

module.exports = router;
