// src/controllers/pontoController.js
const prisma = require('../prismaClient');

// Função para buscar os pontos (incluindo os dados das tabelas relacionadas)
const getPontos = async (req, res) => {
  try {
    const pontos = await prisma.pontos_spda.findMany({
      include: {
        cliente: true,
        area: true,
        tipo_ponto: true
      }
    });
    res.json(pontos);
  } catch (error) {
    console.error("Erro ao buscar pontos:", error);
    res.status(500).json({ erro: "Falha ao buscar os pontos de SPDA." });
  }
};

// Função para criar um novo ponto de SPDA com Código Inteligente
const createPonto = async (req, res) => {
  try {
    const { cliente_id, unidade_id, area_id, tipo_ponto_id, localizacao, descricao, criticidade } = req.body;
    
    // 1. Busca as informações simultaneamente para o código único
    const cliente = await prisma.cliente.findUnique({ where: { id: cliente_id } });
    const area = await prisma.area.findUnique({ where: { id: area_id } });
    const tipo = await prisma.tipo_ponto.findUnique({ where: { id: tipo_ponto_id } });
    const unidadeId = unidade_id || area?.unidade_id;

    if (!cliente || !area || !tipo || !unidadeId) {
      return res.status(400).json({ erro: "Cliente, unidade, área ou tipo de ponto inválido." });
    }

    // 2. Extrai as siglas
    const siglaCli = cliente?.sigla || 'CLI';
    const siglaAre = area?.sigla || 'ARE';
    const siglaTip = tipo?.sigla || 'TIP';
    const baseCodigo = `${siglaCli}-SPDA-${siglaAre}-${siglaTip}`;
    const novoPonto = await prisma.pontos_spda.create({
      data: {
        codigo_unico: `${baseCodigo}-TEMP-${Date.now()}`,
        cliente_id,
        unidade_id: unidadeId,
        area_id,
        tipo_ponto_id,
        localizacao,
        descricao,
        criticidade
      }
    });

    const codigoDefinitivo = `${baseCodigo}-${String(novoPonto.id).padStart(3, '0')}`;
    
    const pontoFinal = await prisma.pontos_spda.update({
      where: { id: novoPonto.id },
      data: { codigo_unico: codigoDefinitivo }
    });

    res.status(201).json(pontoFinal);
  } catch (error) {
    console.error("Erro ao criar ponto:", error);
    res.status(500).json({ erro: "Falha ao criar o ponto de SPDA." });
  }
};

const buscarPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const ponto = await prisma.pontos_spda.findFirst({
      where: {
        codigo_unico: codigo
      },
      include: {
        cliente: true,
        area: true,
        tipo_ponto: true
      }
    });

    if (!ponto) {
      return res.status(404).json({ erro: "Ponto não encontrado no banco de dados." });
    }

    return res.status(200).json(ponto);

  } catch (error) {
    console.error("Erro ao buscar ponto por código:", error);
    return res.status(500).json({ erro: "Erro interno no servidor ao buscar o ponto." });
  }
};

module.exports = {
  getPontos,
  createPonto,
  buscarPorCodigo 
}; 