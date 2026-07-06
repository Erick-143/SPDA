const prisma = require('../prismaClient');

const getDadosCadastro = async (req, res) => {
  try {
    // Busca tudo no banco simultaneamente
    const clientes = await prisma.cliente.findMany({ where: { ativo: true } });
    const unidades = await prisma.unidade.findMany({ where: { ativo: true } });
    const areas = await prisma.area.findMany({ where: { ativo: true } });
    const tipos = await prisma.tipo_ponto.findMany({ where: { ativo: true } });

    // Empacota tudo num JSON e envia
    res.json({ clientes, unidades, areas, tipos });
  } catch (error) {
    console.error("Erro ao buscar dados auxiliares:", error);
    res.status(500).json({ erro: "Falha ao buscar listas." });
  }
};

module.exports = { getDadosCadastro };
