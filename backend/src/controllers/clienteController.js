const prisma = require('../prismaClient');

// Listar apenas clientes ativos
const listarClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { ativo: true } // Garante que só puxamos os clientes ativos
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

// ==========================================
// LÓGICA DE CLIENTES (CRUD)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const formCliente = document.getElementById('form-cliente');
    const renderClientes = document.getElementById('clientes-render');
    const msgFeedback = document.getElementById('mensagem-feedback');

    // 1. Função para carregar e listar os clientes
    async function carregarClientes() {
        try {
            const res = await fetch('http://localhost:3000/api/clientes');
            const clientes = await res.json();
            
            renderClientes.innerHTML = ''; // Limpa a lista
            
            if(clientes.length === 0) {
                renderClientes.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Nenhum cliente cadastrado.</p>';
                return;
            }

            clientes.forEach(cliente => {
                const div = document.createElement('div');
                div.style.display = "flex";
                div.style.justifyContent = "space-between";
                div.style.alignItems = "center";
                div.style.padding = "10px";
                div.style.borderBottom = "1px solid #eee";
                
                // NOVO VISUAL: Crachá "Ativo" + Botão "Inativar"
                div.innerHTML = `
                    <div>
                        <strong>${cliente.nome}</strong> 
                        <span style="color: #666; font-size: 0.8rem;">(${cliente.sigla})</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="background-color: #d4edda; color: #155724; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">
                            ● Ativo
                        </span>
                        <button onclick="inativarCliente(${cliente.id})" style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">
                            Inativar
                        </button>
                    </div>
                `;
                renderClientes.appendChild(div);
            });
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
        }
    }

    // 2. Evento de Cadastro (Submit do formulário)
    if(formCliente) {
        formCliente.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('cliente_nome').value;
            const sigla = document.getElementById('cliente_sigla').value;

            try {
                const res = await fetch('http://localhost:3000/api/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, sigla })
                });

                if(res.ok) {
                    mostrarFeedback('Cliente cadastrado com sucesso!', 'success');
                    formCliente.reset(); // Limpa o formulário
                    carregarClientes(); // Atualiza a lista na tela
                } else {
                    mostrarFeedback('Erro ao cadastrar cliente.', 'error');
                }
            } catch (error) {
                mostrarFeedback('Erro de conexão com o servidor.', 'error');
            }
        });
    }

    // 3. Função Global para Inativar (Substitui a deletarCliente)
    window.inativarCliente = async function(id) {
        // NOVA MENSAGEM
        if(!confirm("Tem certeza que deseja INATIVAR este cliente? Ele será movido para o Arquivo Morto e não aparecerá em novos cadastros.")) return;

        try {
            // Nota: Embora a rota no backend se chame DELETE, no Controller nós configuramos ela para fazer o Update (Soft Delete).
            const res = await fetch(`http://localhost:3000/api/clientes/${id}`, {
                method: 'DELETE'
            });

            if(res.ok) {
                mostrarFeedback('Cliente inativado com sucesso.', 'success');
                carregarClientes(); // Atualiza a lista
            } else {
                mostrarFeedback('Erro ao processar inativação do cliente.', 'error');
            }
        } catch (error) {
            mostrarFeedback('Erro de conexão.', 'error');
        }
    };

    // Função auxiliar para mostrar mensagens bonitas na tela
    function mostrarFeedback(msg, tipo) {
        msgFeedback.innerText = msg;
        msgFeedback.style.color = tipo === 'success' ? '#28a745' : '#dc3545';
        msgFeedback.style.padding = "10px";
        msgFeedback.style.marginTop = "15px";
        msgFeedback.style.fontWeight = "bold";
        
        setTimeout(() => {
            msgFeedback.innerText = "";
        }, 3000); // Some após 3 segundos
    }

    // Chama a função para carregar a lista assim que a página abrir
    carregarClientes();
});



module.exports = { listarClientes, criarCliente, excluirCliente, listarClientesInativos, reativarCliente };

