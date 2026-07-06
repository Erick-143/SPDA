const express = require('express');
const router = express.Router();
const multer = require('multer');
const inspecaoController = require('../controllers/inspecaoController');

// Salvar em (.jpg, .png)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const extensao = file.originalname.split('.').pop();
    cb(null, `foto_${Date.now()}.${extensao}`);
  }
});

const upload = multer({ storage: storage });


// POST para cadastrar o laudo
router.post('/', upload.single('foto'), inspecaoController.createInspecao);

// GET para trazer a Ficha Digital do Ponto (Ex: /api/inspecoes/ponto/1)
router.get('/ponto/:ponto_id', inspecaoController.getInspecoesPorPonto);

module.exports = router;
