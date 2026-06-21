// src/controllers/dashboardController.js
const prisma = require('../prismaClient');

const getResumo = async (req, res) => {
  try {
    // 1. Conta o Total de Pontos Cadastrados
    const totalPontos = await prisma.pontos_spda.count();

    // 2. Conta quantas inspeções deram "Conforme"
    const inspecoesConformes = await prisma.inspecoes.count({
      where: { conformidade: true }
    });

    // 3. Conta quantas deram "Não Conforme"
    const inspecoesNaoConformes = await prisma.inspecoes.count({
      where: { conformidade: false }
    });

    // 4. Pega as últimas 5 inspeções para a "Evolução Temporal"
    const ultimasInspecoes = await prisma.inspecoes.findMany({
      take: 5,
      orderBy: { data_inspecao: 'desc' },
      include: { pontos_spda: true }
    });

    // Devolve tudo mastigado em um único JSON para o Chart.js do Frontend brilhar
    res.json({
      totalPontos,
      conformidade: {
        conformes: inspecoesConformes,
        naoConformes: inspecoesNaoConformes
      },
      ultimasInspecoes
    });
  } catch (error) {
    console.error("Erro ao gerar dashboard:", error);
    res.status(500).json({ erro: "Falha ao carregar métricas do dashboard." });
  }
};

module.exports = {
  getResumo
};
