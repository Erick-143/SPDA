// src/controllers/dashboardController.js
const prisma = require('../prismaClient');

const getResumo = async (req, res) => {
  try {
   const totalPontos = await prisma.pontos_spda.count({
  where: { ativo: true }
});

        const inspecoesConformes = await prisma.inspecoes.count({
      where: { 
        conformidade: true,
        pontos_spda: { ativo: true } 
      }
    });

    const inspecoesNaoConformes = await prisma.inspecoes.count({
      where: { 
        conformidade: false,
        pontos_spda: { ativo: true }
      }
    });


    // Calculando a média direto no banco de dados, pontos inativos não são contabilizados 
    const mediaObj = await prisma.inspecoes.aggregate({
      _avg: { resistencia_aterramento: true },
      where: { pontos_spda: { ativo: true } }
    });
    const mediaResistencia = mediaObj._avg.resistencia_aterramento 
                           ? parseFloat(mediaObj._avg.resistencia_aterramento).toFixed(2)
                           : "0.00";

    const ultimasInspecoes = await prisma.inspecoes.findMany({
      take: 5,
      orderBy: { data_inspecao: 'desc' },
      include: { pontos_spda: true },
      where: { pontos_spda: { ativo: true } } 
    });

    res.json({
      totalPontos,
      conformidade: {
        conformes: inspecoesConformes,
        naoConformes: inspecoesNaoConformes
      },
      mediaResistencia,
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
