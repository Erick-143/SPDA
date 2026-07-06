const prisma = require('../prismaClient');

// Listar áreas ATIVAS com Filtro Inteligente (Verificando Unidade e Cliente)
const listarAreas = async (req, res) => {
  try {
    const areas = await prisma.area.findMany({
      where: { 
        ativo: true,
        unidade: { 
          ativo: true,
          cliente: { ativo: true } 
        } 
      },
      include: { 
        unidade: {
          include: { cliente: true } 
        }
      }
    });
    res.json(areas);
  } catch (error) {
    console.error("Erro ao listar áreas:", error);
    res.status(500).json({ erro: "Erro ao buscar áreas." });
  }
};

// Criar nova área
const criarArea = async (req, res) => {
  try {
    const { unidade_id, nome, sigla } = req.body;
    if (!unidade_id || !nome || !sigla) return res.status(400).json({ erro: "Dados incompletos." });

    const novaArea = await prisma.area.create({
      data: { unidade_id: parseInt(unidade_id), nome, sigla }
    });
    res.status(201).json(novaArea);
  } catch (error) {
    console.error("Erro ao criar área:", error);
    res.status(500).json({ erro: "Erro ao cadastrar área." });
  }
};

// Calcular impacto da inativação (Só tem Pontos de SPDA abaixo da Área)
const calcularImpactoArea = async (req, res) => {
  try {
    const { id } = req.params;
    const areaId = parseInt(id);

    const totalPontos = await prisma.pontos_spda.count({ where: { area_id: areaId } });

    res.json({ pontos: totalPontos });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao calcular impacto." });
  }
};

// Inativar
const excluirArea = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.area.update({
      where: { id: parseInt(id) },
      data: { ativo: false }
    });
    res.json({ mensagem: "Área inativada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao inativar área." });
  }
};

// Arquivo Morto: Listar Inativas
const listarAreasInativas = async (req, res) => {
  try {
    const areas = await prisma.area.findMany({
      where: { ativo: false },
      include: { unidade: { include: { cliente: true } } }
    });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar inativas." });
  }
};

// Reativar
const reativarArea = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.area.update({
      where: { id: parseInt(id) },
      data: { ativo: true }
    });
    res.json({ mensagem: "Reativada com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao reativar." });
  }
};

module.exports = { listarAreas, criarArea, excluirArea, calcularImpactoArea, listarAreasInativas, reativarArea };
