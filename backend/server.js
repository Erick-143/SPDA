// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const dashboardRoutes = require('./src/routes/dashboardRoutes.js');


// Importando as nossas rotas modulares
const areaRoutes = require('./src/routes/areaRoutes');
const pontoRoutes = require('./src/routes/pontoRoutes.js');
const inspecaoRoutes = require('./src/routes/inspecaoRoutes.js');
const authRoutes = require('./src/routes/authRoutes.js');
const auxiliarRoutes = require('./src/routes/auxiliarRoutes.js');

const app = express();

app.use(cors());
app.use(express.json());

// 📍 Rota de Teste de Vida
app.get('/api/teste', (req, res) => {
  res.json({ mensagem: 'Servidor SmartLab a funcionar perfeitamente! 🚀' });
});

// 📍 Rotas de Negócio
app.use('/api/areas', areaRoutes); // Todas as requisições para /api/areas caem no arquivo de rotas de Área

app.use('/api/pontos', pontoRoutes);

app.use('/api/inspecoes', inspecaoRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/auxiliar', auxiliarRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
