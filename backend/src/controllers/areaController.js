// src/controllers/areaController.js
const prisma = require('../prismaClient');

const getAreas = async (req, res) => {
  try {
    const areas = await prisma.area.findMany(); // Busca todas as áreas usando Prisma
    res.json(areas); // Envolve e devolve em formato JSON para o Frontend
  } catch (error) {
    console.error("Erro ao buscar áreas:", error);
    res.status(500).json({ erro: "Falha ao buscar as áreas." });
  }
};

module.exports = {
  getAreas
};
