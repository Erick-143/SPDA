const prisma = require('../prismaClient');

const listarTipos = async (req, res) => {
  try {
    const tipos = await prisma.tipo_ponto.findMany({ where: { ativo: true } });
    res.json(tipos);
  } catch (error) { res.status(500).json({ erro: "Erro ao buscar tipos." }); }
};

const criarTipo = async (req, res) => {
  try {
    const { nome, sigla } = req.body;
    if (!nome || !sigla) return res.status(400).json({ erro: "Dados incompletos." });
    const novo = await prisma.tipo_ponto.create({ data: { nome, sigla } });
    res.status(201).json(novo);
  } catch (error) { res.status(500).json({ erro: "Erro ao cadastrar tipo." }); }
};

const calcularImpactoTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const totalPontos = await prisma.pontos_spda.count({ where: { tipo_ponto_id: parseInt(id) } });
    res.json({ pontos: totalPontos });
  } catch (error) { res.status(500).json({ erro: "Erro ao calcular impacto." }); }
};

const excluirTipo = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tipo_ponto.update({ where: { id: parseInt(id) }, data: { ativo: false } });
    res.json({ mensagem: "Tipo inativado com sucesso!" });
  } catch (error) { res.status(500).json({ erro: "Erro ao inativar tipo." }); }
};

const listarTiposInativos = async (req, res) => {
  try {
    const tipos = await prisma.tipo_ponto.findMany({ where: { ativo: false } });
    res.json(tipos);
  } catch (error) { res.status(500).json({ erro: "Erro ao buscar inativos." }); }
};

const reativarTipo = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tipo_ponto.update({ where: { id: parseInt(id) }, data: { ativo: true } });
    res.json({ mensagem: "Reativado com sucesso!" });
  } catch (error) { res.status(500).json({ erro: "Erro ao reativar." }); }
};

module.exports = { listarTipos, criarTipo, excluirTipo, calcularImpactoTipo, listarTiposInativos, reativarTipo };
