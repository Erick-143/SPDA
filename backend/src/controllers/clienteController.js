const prisma = require('../prismaClient');

// Listar apenas clientes ativos
const listarClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { ativo: true } 
    });
    res.json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ erro: "Erro ao buscar clientes." });
  }
};

// Criar um novo cliente
const criarCliente = async (req, res) => {
  try {
    const { nome, sigla } = req.body;
    if (!nome || !sigla) return res.status(400).json({ erro: "Nome e sigla são obrigatórios." });

    const novoCliente = await prisma.cliente.create({
      data: { nome, sigla }
    });
    res.status(201).json(novoCliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({ erro: "Erro ao cadastrar cliente." });
  }
};

// "Excluir" (Inativar) um cliente
const excluirCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ao invés de usar o .delete(), usamos o .update()
    await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { ativo: false } // Muda o status para inativo
    });
    
    res.json({ mensagem: "Cliente inativado com sucesso!" });
  } catch (error) {
    console.error("Erro ao inativar cliente:", error);
    res.status(500).json({ erro: "Erro ao processar exclusão do cliente." });
  }
};

// Listar apenas clientes INATIVOS
const listarClientesInativos = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { ativo: false }
    });
    res.json(clientes);
  } catch (error) {
    console.error("Erro ao listar inativos:", error);
    res.status(500).json({ erro: "Erro ao buscar inativos." });
  }
};

// Reativar um cliente
const reativarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { ativo: true }
    });
    
    res.json({ mensagem: "Cliente reativado com sucesso!" });
  } catch (error) {
    console.error("Erro ao reativar cliente:", error);
    res.status(500).json({ erro: "Erro ao processar reativação." });
  }
};


// Calcular impacto antes de inativar
const calcularImpactoCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = parseInt(id);

    // Conta quantas unidades o cliente tem
    const totalUnidades = await prisma.unidade.count({
      where: { cliente_id: clienteId }
    });

    // Conta quantas áreas (que pertencem às unidades deste cliente)
    const totalAreas = await prisma.area.count({
      where: { unidade: { cliente_id: clienteId } }
    });

    // Conta quantos pontos de SPDA
    const totalPontos = await prisma.pontos_spda.count({
      where: { cliente_id: clienteId }
    });

    res.json({
      unidades: totalUnidades,
      areas: totalAreas,
      pontos: totalPontos
    });
  } catch (error) {
    console.error("Erro ao calcular impacto:", error);
    res.status(500).json({ erro: "Erro ao calcular impacto." });
  }
};

module.exports = { listarClientes, criarCliente, excluirCliente, listarClientesInativos, reativarCliente, calcularImpactoCliente };
