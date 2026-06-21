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
    const { cliente_id, area_id, tipo_ponto_id, localizacao, descricao, criticidade } = req.body;
    
    // 1. Busca as informações simultaneamente para o código único
    const cliente = await prisma.cliente.findUnique({ where: { id: cliente_id } });
    const area = await prisma.area.findUnique({ where: { id: area_id } });
    const tipo = await prisma.tipo_ponto.findUnique({ where: { id: tipo_ponto_id } });

    // 2. Extrai as siglas
    const siglaCli = cliente?.sigla || 'CLI';
    const siglaAre = area?.sigla || 'ARE';
    const siglaTip = tipo?.sigla || 'TIP';

    // 3. Monta a base do código no padrão EXATO da banca (Ex: RZ-SPDA-TQ-CI)
    const baseCodigo = `${siglaCli}-SPDA-${siglaAre}-${siglaTip}`;

    // 4. Cria o ponto com um sufixo temporário (para o banco gerar o ID)
    const novoPonto = await prisma.pontos_spda.create({
      data: {
        codigo_unico: `${baseCodigo}-TEMP-${Date.now()}`,
        cliente_id,
        area_id,
        tipo_ponto_id,
        localizacao,
        descricao,
        criticidade
      }
    });

    // 5. Atualiza o ponto trocando o "TEMP" pelo ID sequencial (Ex: RZ-SPDA-TQ-CI-001)
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

// Exportando TUDO para as rotas poderem enxergar!
module.exports = {
  getPontos,
  createPonto
};
