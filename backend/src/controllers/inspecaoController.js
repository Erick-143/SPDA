// src/controllers/inspecaoController.js
const prisma = require('../prismaClient');

// 1. Função para o técnico registrar um novo laudo de inspeção
const createInspecao = async (req, res) => {
  try {
    const { 
      ponto_id, 
      usuario_id, 
      condicao_visual, 
      continuidade_eletrica, 
      resistencia_aterramento, 
      oxidacao, 
      necessidade_correcao, 
      conformidade, 
      observacoes 
    } = req.body;

    const novaInspecao = await prisma.inspecoes.create({
      data: {
        ponto_id,
        usuario_id,
        condicao_visual,
        continuidade_eletrica,
        resistencia_aterramento,
        oxidacao,
        necessidade_correcao,
        conformidade,
        observacoes
      }
    });

    res.status(201).json(novaInspecao);
  } catch (error) {
    console.error("Erro ao registrar inspeção:", error);
    res.status(500).json({ erro: "Falha ao registrar a inspeção técnica." });
  }
};

// 2. Função para buscar o histórico da Ficha Digital (usada ao ler o QR Code)
const getInspecoesPorPonto = async (req, res) => {
  try {
    const { ponto_id } = req.params; // Pega o ID do ponto que vem na URL

    const historico = await prisma.inspecoes.findMany({
      where: { ponto_id: Number(ponto_id) },
      orderBy: { data_inspecao: 'desc' }, // Traz as medições mais novas primeiro
      include: {
        usuarios: true // Traz os dados do técnico que fez a inspeção
      }
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
