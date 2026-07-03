const prisma = require('../prismaClient');

const getDadosCadastro = async (req, res) => {
  try {
    // Busca tudo no banco simultaneamente
    const clientes = await prisma.cliente.findMany();
    const unidades = await prisma.unidade.findMany();
    const areas = await prisma.area.findMany();
    const tipos = await prisma.tipo_ponto.findMany();

    // Empacota tudo num JSON e envia
    res.json({ clientes, unidades, areas, tipos });
  } catch (error) {
    console.error("Erro ao buscar dados auxiliares:", error);
    res.status(500).json({ erro: "Falha ao buscar listas." });
  }
};

module.exports = { getDadosCadastro };
