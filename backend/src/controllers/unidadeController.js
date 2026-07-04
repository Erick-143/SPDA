const prisma = require('../prismaClient');
// Listar unidades ATIVAS E que o Cliente dono também esteja ATIVO
const listarUnidades = async (req, res) => {
  try {
    const unidades = await prisma.unidade.findMany({
      where: { 
        ativo: true,
        cliente: { ativo: true } // FILTRO INTELIGENTE
      },
      include: { cliente: true } // Traz os dados do cliente junto
    });
    res.json(unidades);
  } catch (error) {
    console.error("Erro ao listar unidades:", error);
    res.status(500).json({ erro: "Erro ao buscar unidades." });
  }
};
// Criar nova unidade
const criarUnidade = async (req, res) => {
  try {
    const { cliente_id, nome } = req.body;
    if (!cliente_id || !nome) return res.status(400).json({ erro: "Cliente e Nome são obrigatórios." });
    const novaUnidade = await prisma.unidade.create({
      data: { cliente_id: parseInt(cliente_id), nome }
    });
    res.status(201).json(novaUnidade);
  } catch (error) {
    console.error("Erro ao criar unidade:", error);
    res.status(500).json({ erro: "Erro ao cadastrar unidade." });
  }
};
// Calcular impacto da inativação
const calcularImpactoUnidade = async (req, res) => {
  try {
    const { id } = req.params;
    const unidadeId = parseInt(id);
    const totalAreas = await prisma.area.count({ where: { unidade_id: unidadeId } });
    const totalPontos = await prisma.pontos_spda.count({ where: { unidade_id: unidadeId } });
    res.json({ areas: totalAreas, pontos: totalPontos });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao calcular impacto." });
  }
};
// Soft Delete (Inativar)
const excluirUnidade = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.unidade.update({
      where: { id: parseInt(id) },
      data: { ativo: false }
    });
    res.json({ mensagem: "Unidade inativada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao inativar unidade." });
  }
};
// Arquivo Morto: Listar Inativas
const listarUnidadesInativas = async (req, res) => {
  try {
    const unidades = await prisma.unidade.findMany({
      where: { ativo: false },
      include: { cliente: true }
    });
    res.json(unidades);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar inativas." });
  }
};
// Reativar
const reativarUnidade = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.unidade.update({
      where: { id: parseInt(id) },
      data: { ativo: true }
    });
    res.json({ mensagem: "Reativada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao reativar." });
  }
};
module.exports = { listarUnidades, criarUnidade, excluirUnidade, calcularImpactoUnidade, listarUnidadesInativas, reativarUnidade };