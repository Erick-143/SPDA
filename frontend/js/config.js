//logica de flutuação de páginas
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-ctt');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');

            const tabId = button.getAttribute('data-tab');
            
            document.getElementById(tabId).classList.add('active');
        });
    });
});

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
                renderClientes.innerHTML = '<p class="config-lista-vazia">Nenhum cliente cadastrado.</p>';
                return;
            }

            clientes.forEach(cliente => {
                const div = document.createElement('div');
                div.className = 'config-item';
                
                // NOVO VISUAL: Crachá "Ativo" + Botão "Inativar"
                div.innerHTML = `
                    <div class="config-item-info">
                        <strong>${cliente.nome}</strong> 
                        <span class="config-item-meta">(${cliente.sigla})</span>
                    </div>
                    <div class="config-item-acoes">
                        <span class="status-ativo">
                            ● Ativo
                        </span>
                        <button class="btn-inativar" onclick="inativarCliente(${cliente.id})">
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
                    popularSelectClientes(); // Atualiza a caixinha de seleção
                } else {
                    mostrarFeedback('Erro ao cadastrar cliente.', 'error');
                }
            } catch (error) {
                mostrarFeedback('Erro de conexão com o servidor.', 'error');
            }
        });
    }

   // 3. Função Global para Inativar (Com Análise de Impacto)
    window.inativarCliente = async function(id) {
        try {
            // Passo 1: Pergunta pro backend o tamanho do impacto
            const resImpacto = await fetch(`http://localhost:3000/api/clientes/${id}/impacto`);
            if(!resImpacto.ok) throw new Error("Erro ao calcular impacto");
            
            const impacto = await resImpacto.json();
            
            // Passo 2: Monta a mensagem personalizada dinâmica
            const mensagem = ` ATENÇÃO! Ao inativar este cliente, você também ocultará do sistema:\n\n` +
                             ` ${impacto.unidades} Unidades\n` +
                             ` ${impacto.areas} Áreas\n` +
                             ` ${impacto.pontos} Pontos de Inspeção\n\n` +
                             `Deseja continuar e mover tudo para o Arquivo Morto?`;
                             
            // Passo 3: Exibe o Alerta. Se o usuário clicar em Cancelar, o código para aqui.
            if(!confirm(mensagem)) return;
            // Passo 4: Se o usuário confirmar, faz a inativação
            const res = await fetch(`http://localhost:3000/api/clientes/${id}`, {
                method: 'DELETE' // Chama o Soft Delete
            });
            if(res.ok) {
                mostrarFeedback('Cliente inativado com sucesso.', 'success');
                carregarClientes(); // Atualiza a lista na tela principal
                popularSelectClientes(); // Atualiza a caixinha de seleção
                
                // Manda atualizar tudo que depende do cliente instantaneamente!
                carregarUnidades();
                popularSelectUnidades();
                carregarAreas();

            } else {
                mostrarFeedback('Erro ao processar inativação do cliente.', 'error');
            }
        } catch (error) {
            mostrarFeedback('Erro de conexão ou cálculo de impacto.', 'error');
        }
    };

       // ==========================================
    // LÓGICA DE UNIDADES (CRUD)
    // ==========================================
    const formUnidade = document.getElementById('form-unidade');
    const renderUnidades = document.getElementById('unidade-render');
    const selectUnidadeCliente = document.getElementById('unidade_cliente');

    // Função para carregar a caixinha de seleção com os clientes disponíveis
    async function popularSelectClientes() {
        try {
            const res = await fetch('http://localhost:3000/api/clientes');
            const clientes = await res.json();
            
            selectUnidadeCliente.innerHTML = '<option value="">Selecione um cliente:</option>';
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome;
                selectUnidadeCliente.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar clientes para o select:", error);
        }
    }

    // Função para carregar a lista de unidades na tela
    async function carregarUnidades() {
        try {
            const res = await fetch('http://localhost:3000/api/unidades');
            const unidades = await res.json();
            
            renderUnidades.innerHTML = ''; 
            
            if(unidades.length === 0) {
                renderUnidades.innerHTML = '<p class="config-lista-vazia">Nenhuma unidade cadastrada.</p>';
                return;
            }

            unidades.forEach(unidade => {
                const div = document.createElement('div');
                div.className = 'config-item';
                
                div.innerHTML = `
                    <div class="config-item-info">
                        <strong>${unidade.nome}</strong> 
                        <span class="config-item-meta">(Cliente: ${unidade.cliente.nome})</span>
                    </div>
                    <div class="config-item-acoes">
                        <span class="status-ativo">
                            ● Ativo
                        </span>
                        <button class="btn-inativar" onclick="inativarUnidade(${unidade.id})">
                            Inativar
                        </button>
                    </div>
                `;
                renderUnidades.appendChild(div);
            });
        } catch (error) {
            console.error("Erro ao carregar unidades:", error);
        }
    }

    // Evento de Cadastrar Unidade
    if(formUnidade) {
        formUnidade.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cliente_id = selectUnidadeCliente.value;
            const nome = document.getElementById('unidade_nome').value;

            try {
                const res = await fetch('http://localhost:3000/api/unidades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cliente_id, nome })
                });

                if(res.ok) {
                    mostrarFeedback('Unidade cadastrada com sucesso!', 'success');
                    popularSelectUnidades();
                    formUnidade.reset();
                    carregarUnidades();
                } else {
                    mostrarFeedback('Erro ao cadastrar unidade.', 'error');
                }
            } catch (error) {
                mostrarFeedback('Erro de conexão.', 'error');
                popularSelectUnidades();
            }
        });
    }

    // Função Global para Inativar Unidade (Com Análise de Impacto)
    window.inativarUnidade = async function(id) {
        try {
            const resImpacto = await fetch(`http://localhost:3000/api/unidades/${id}/impacto`);
            if(!resImpacto.ok) throw new Error("Erro ao calcular impacto");
            
            const impacto = await resImpacto.json();
            
            const mensagem = ` ATENÇÃO! Ao inativar esta unidade, você também ocultará:\n\n` +
                             ` ${impacto.areas} Áreas\n` +
                             ` ${impacto.pontos} Pontos de Inspeção\n\n` +
                             `Deseja continuar?`;
                             
            if(!confirm(mensagem)) return;

            const res = await fetch(`http://localhost:3000/api/unidades/${id}`, { method: 'DELETE' });

            if(res.ok) {
                mostrarFeedback('Unidade inativada com sucesso.', 'success');
                carregarUnidades();
                popularSelectUnidades();
                
                // Manda atualizar as áreas que dependem dessa unidade instantaneamente!
                carregarAreas();
            } else {
                mostrarFeedback('Erro ao inativar unidade.', 'error');
            }
        } catch (error) {
            mostrarFeedback('Erro de conexão ou cálculo.', 'error');
        }
    };

    // Chamar as funções quando a página abre
    popularSelectClientes();
    carregarUnidades();

    // ==========================================
    // LÓGICA DE ÁREAS (CRUD)
    // ==========================================
    const formArea = document.getElementById('form-area');
    const renderAreas = document.getElementById('areas-render');
    const selectAreaUnidade = document.getElementById('area_unidade');

    // Função para carregar as unidades disponíveis no select
    async function popularSelectUnidades() {
        try {
            const res = await fetch('http://localhost:3000/api/unidades');
            const unidades = await res.json();
            
            selectAreaUnidade.innerHTML = '<option value="">Selecione uma unidade:</option>';
            unidades.forEach(unidade => {
                const option = document.createElement('option');
                option.value = unidade.id;
                // Mostra: Nome da Unidade (Nome do Cliente) para facilitar
                option.textContent = `${unidade.nome} (${unidade.cliente.nome})`;
                selectAreaUnidade.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar unidades para o select:", error);
        }
    }

    // Função para carregar a lista de áreas na tela
    async function carregarAreas() {
        try {
            const res = await fetch('http://localhost:3000/api/areas');
            const areas = await res.json();
            
            renderAreas.innerHTML = ''; 
            
            if(areas.length === 0) {
                renderAreas.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Nenhuma área cadastrada.</p>';
                return;
            }

            areas.forEach(area => {
                const div = document.createElement('div');
                div.className = 'config-item';
                
                div.innerHTML = `
                    <div>
                        <strong>${area.nome}</strong> <span class="config-item-meta">(${area.sigla})</span>
                        <div class="config-item-submeta">
                            Unidade: ${area.unidade.nome} | Cliente: ${area.unidade.cliente.nome}
                        </div>
                    </div>
                    <div class="config-item-acoes">
                        <span class="status-ativo">
                            ● Ativo
                        </span>
                        <button class="btn-inativar" onclick="inativarArea(${area.id})">
                            Inativar
                        </button>
                    </div>
                `;
                renderAreas.appendChild(div);
            });
        } catch (error) {
            console.error("Erro ao carregar áreas:", error);
        }
    }

    // Evento de Cadastrar Área
    if(formArea) {
        formArea.addEventListener('submit', async (e) => {
            e.preventDefault();
            const unidade_id = selectAreaUnidade.value;
            const nome = document.getElementById('area_nome').value;
            const sigla = document.getElementById('area_sigla').value;

            try {
                const res = await fetch('http://localhost:3000/api/areas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ unidade_id, nome, sigla })
                });

                if(res.ok) {
                    mostrarFeedback('Área cadastrada com sucesso!', 'success');
                    formArea.reset();
                    carregarAreas();
                } else {
                    mostrarFeedback('Erro ao cadastrar área.', 'error');
                }
            } catch (error) {
                mostrarFeedback('Erro de conexão.', 'error');
            }
        });
    }

    // Função Global para Inativar Área (Com Análise de Impacto)
    window.inativarArea = async function(id) {
        try {
            const resImpacto = await fetch(`http://localhost:3000/api/areas/${id}/impacto`);
            if(!resImpacto.ok) throw new Error("Erro ao calcular impacto");
            
            const impacto = await resImpacto.json();
            
            const mensagem = ` ATENÇÃO! Ao inativar esta área, você também ocultará:\n\n` +
                             ` ${impacto.pontos} Pontos de Inspeção\n\n` +
                             `Deseja continuar?`;
                             
            if(!confirm(mensagem)) return;

            const res = await fetch(`http://localhost:3000/api/areas/${id}`, { method: 'DELETE' });

            if(res.ok) {
                mostrarFeedback('Área inativada com sucesso.', 'success');
                carregarAreas();
            } else {
                mostrarFeedback('Erro ao inativar área.', 'error');
            }
        } catch (error) {
            mostrarFeedback('Erro de conexão ou cálculo.', 'error');
        }
    };

    // Inicializa a aba de áreas quando a página carrega
    popularSelectUnidades();
    carregarAreas();
    // ==========================================


      // ==========================================
    // LÓGICA DE TIPOS DE PONTO (CRUD)
    // ==========================================
    const formTipo = document.getElementById('form-tipo');
    const renderTipos = document.getElementById('tipos-render');
    // Função para carregar a lista de tipos na tela
    async function carregarTipos() {
        try {
            const res = await fetch('http://localhost:3000/api/tipos');
            const tipos = await res.json();
            
            renderTipos.innerHTML = ''; 
            
            if(tipos.length === 0) {
                renderTipos.innerHTML = '<p class="config-lista-vazia">Nenhum tipo cadastrado.</p>';
                return;
            }
            tipos.forEach(tipo => {
                const div = document.createElement('div');
                div.className = 'config-item';
                
                div.innerHTML = `
                    <div>
                        <strong>${tipo.nome}</strong> <span class="config-item-meta">(${tipo.sigla})</span>
                    </div>
                    <div class="config-item-acoes">
                        <span class="status-ativo">
                            ● Ativo
                        </span>
                        <button class="btn-inativar" onclick="inativarTipo(${tipo.id})">
                            Inativar
                        </button>
                    </div>
                `;
                renderTipos.appendChild(div);
            });
        } catch (error) {
            console.error("Erro ao carregar tipos:", error);
        }
    }
    // Evento de Cadastrar Tipo de Ponto
    if(formTipo) {
        formTipo.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('tipo_nome').value;
            const sigla = document.getElementById('tipo_sigla').value;
            try {
                const res = await fetch('http://localhost:3000/api/tipos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, sigla })
                });
                if(res.ok) {
                    mostrarFeedback('Tipo de Ponto cadastrado com sucesso!', 'success');
                    formTipo.reset();
                    carregarTipos();
                } else {
                    mostrarFeedback('Erro ao cadastrar tipo.', 'error');
                }
            } catch (error) {
                mostrarFeedback('Erro de conexão.', 'error');
            }
        });
    }
    // Função Global para Inativar Tipo (Com Análise de Impacto)
    window.inativarTipo = async function(id) {
        try {
            const resImpacto = await fetch(`http://localhost:3000/api/tipos/${id}/impacto`);
            if(!resImpacto.ok) throw new Error("Erro ao calcular impacto");
            
            const impacto = await resImpacto.json();
            
            const mensagem = ` ATENÇÃO! Ao inativar este Tipo, você ocultará ele de todos os menus. E mais:\n\n` +
                             ` Existem ${impacto.pontos} Pontos de Inspeção vinculados a ele.\n\n` +
                             `Deseja continuar?`;
                             
            if(!confirm(mensagem)) return;
            const res = await fetch(`http://localhost:3000/api/tipos/${id}`, { method: 'DELETE' });
            if(res.ok) {
                mostrarFeedback('Tipo inativado com sucesso.', 'success');
                carregarTipos();
            } else {
                mostrarFeedback('Erro ao inativar tipo.', 'error');
            }
        } catch (error) {
            mostrarFeedback('Erro de conexão ou cálculo.', 'error');
        }
    };
    // Inicializa a aba de tipos quando a página carrega
    carregarTipos();
    // ==========================================
    // Função auxiliar para mostrar mensagens bonitas na tela
    function mostrarFeedback(msg, tipo) {
        const msgFeedback = document.getElementById('mensagem-feedback');
        if(!msgFeedback) return;
        
        msgFeedback.innerText = msg;
        msgFeedback.style.color = tipo === 'success' ? '#4a8bdf' : '#dc3545';
        msgFeedback.style.padding = "10px";
        msgFeedback.style.marginTop = "15px";
        msgFeedback.style.fontWeight = "bold";
        
        setTimeout(() => {
            msgFeedback.innerText = "";
        }, 3000);
    }

    // Chama a função para carregar a lista de clientes inicial
    carregarClientes();

});
