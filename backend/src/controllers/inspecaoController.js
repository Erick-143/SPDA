const prisma = require('../prismaClient');

const createInspecao = async (req, res) => {
  try {
    const { 
      ponto_id, 
      usuario_id, 
      data_inspecao, 
      condicao_visual, 
      continuidade_eletrica, 
      resistencia_aterramento, 
      oxidacao, 
      necessidade_correcao, 
      conformidade, 
      observacoes 
    } = req.body;

    // 1. Captura o caminho da foto se ela existir
    const fotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const novaInspecao = await prisma.inspecoes.create({
      data: {
        ponto_id: Number(ponto_id),
        usuario_id: Number(usuario_id),
        data_inspecao: new Date(data_inspecao), 
        condicao_visual,
        continuidade_eletrica: continuidade_eletrica ? Number(continuidade_eletrica) : null,
        resistencia_aterramento: resistencia_aterramento ? Number(resistencia_aterramento) : null,
        oxidacao: oxidacao === 'true' || oxidacao === true,
        necessidade_correcao: necessidade_correcao === 'true' || necessidade_correcao === true,
        conformidade: conformidade === 'true' || conformidade === true,
        observacoes,
        foto_url: fotoUrl 
      }
    });

    await prisma.pontos_spda.update({
      where: { id: Number(ponto_id) },
      data: { status: conformidade === 'true' || conformidade === true }
    });

    res.status(201).json(novaInspecao);
  } catch (error) {
    console.error("Erro ao registrar inspeção:", error);
    res.status(500).json({ erro: "Falha ao registrar a inspeção técnica." });
  }
};

const getInspecoesPorPonto = async (req, res) => {
  try {
    const { ponto_id } = req.params; 

    const historico = await prisma.inspecoes.findMany({
      where: { ponto_id: Number(ponto_id) },
      orderBy: { data_inspecao: 'desc' }, 
      include: { usuarios: true }
    });

    res.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ erro: "Falha ao buscar histórico de inspeções." });
  }
};

module.exports = {
  createInspecao,
  getInspecoesPorPonto
};