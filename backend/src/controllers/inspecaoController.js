// src/controllers/inspecaoController.js
const prisma = require('../prismaClient');

// 1. Função para o técnico registrar um novo laudo de inspeção
const createInspecao = async (req, res) => {
  try {
    const { 
      ponto_id, 
      usuario_id, 
      data_inspecao,           
      responsavel_digitado,    
      condicao_visual, 
      continuidade_eletrica, 
      resistencia_aterramento, 
      oxidacao, 
      necessidade_correcao, 
      conformidade, 
      observacoes 
    } = req.body;

    // O schema não possui a coluna "responsavel" na tabela inspecoes (usa relacionamento com usuarios)
    // aqui eu to anexando no inicio das observações técnicas 
    let observacaoFinal = observacoes || '';
    if (responsavel_digitado) {
        observacaoFinal = `[Responsável Técnico: ${responsavel_digitado}] ` + observacaoFinal;
    }

    const novaInspecao = await prisma.inspecoes.create({
      data: {
        ponto_id: Number(ponto_id),
        usuario_id: Number(usuario_id),
        data_inspecao: new Date(data_inspecao), 
        condicao_visual,
        continuidade_eletrica,
        resistencia_aterramento,
        oxidacao: Boolean(oxidacao),
        necessidade_correcao: Boolean(necessidade_correcao),
        conformidade: Boolean(conformidade),
        observacoes: observacaoFinal
      }
    });

    await prisma.pontos_spda.update({
      where: { id: Number(ponto_id) },
      data: { status: Boolean(conformidade) }
    });

    res.status(201).json(novaInspecao);
  } catch (error) {
    console.error("Erro ao registrar inspeção:", error);
    res.status(500).json({ erro: "Falha ao registrar a inspeção técnica." });
  }
};

// 2. Função para buscar o histórico da Ficha Digital 
const getInspecoesPorPonto = async (req, res) => {
  try {
    const { ponto_id } = req.params; 

    const historico = await prisma.inspecoes.findMany({
      where: { ponto_id: Number(ponto_id) },
      orderBy: { data_inspecao: 'desc' }, 
      include: {
        usuarios: true 
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