// Variáveis globais para guardar a lista e filtrar sem travar o servidor
let listaUnidades = [];
let listaAreas = [];
let listaClientes = [];
let listaTipos = [];

//teste
const dadosMock = {
    clientes: [
        { id: 1, nome: 'Raízen', sigla: 'RZ' },
        { id: 2, nome: 'Petrobras', sigla: 'PETRO' }
    ],
    unidades: [
        { id: 1, nome: 'Unidade A', sigla: 'UA', cliente_id: 1 },
        { id: 2, nome: 'Unidade B', sigla: 'UB', cliente_id: 1 }
    ],
    areas: [
        { id: 1, nome: 'Tanques', sigla: 'TQ', unidade_id: 1 },
        { id: 2, nome: 'Administrativo', sigla: 'ADM', unidade_id: 1 }
    ],
    tipos: [
        { id: 1, nome: 'Caixa Inspeção', sigla: 'CI' },
        { id: 2, nome: 'Descida SPDA', sigla: 'DESC' }
    ]
};


document.addEventListener('DOMContentLoaded', () => {
    carregarOpcoes();
    
    // Event listeners existentes
    document.getElementById('cliente').addEventListener('change', filtrarUnidades);
    document.getElementById('unidade').addEventListener('change', filtrarAreas);
    
    // NOVOS: Listeners para gerar preview do código
    document.getElementById('area').addEventListener('change', gerarCodigoPreview);
    document.getElementById('tipo_ponto').addEventListener('change', gerarCodigoPreview);
    
    // Submit do formulário
    document.getElementById('form-cadastro-ponto').addEventListener('submit', salvarPonto);
    
    // Botão limpar
    document.querySelector('.btn-seg').addEventListener('click', function() {
        document.getElementById('form-cadastro-ponto').reset();
        document.getElementById('codigo-gerado').innerHTML = '';
        document.getElementById('mensagem-feedback').style.display = 'none';
        removerQRCode();
    });

});

async function carregarOpcoes() {
    try {
        const res = await fetch('http://localhost:3000/api/auxiliar/dados-cadastro');
        
        if (!res.ok) {
            console.error('Erro ao carregar dados do banco:', res.status);
            document.getElementById('cliente').innerHTML = '<option value="">Erro ao carregar clientes</option>';
            document.getElementById('tipo_ponto').innerHTML = '<option value="">Erro ao carregar tipos</option>';
            return;
        }
        
        const dados = await res.json();
        
        // Armazena as listas vindas do banco de dados globalmente
        listaClientes = dados.clientes || [];
        listaUnidades = dados.unidades || [];
        listaAreas = dados.areas || [];
        listaTipos = dados.tipos || [];

        // Preenche o Select de Clientes
        const selectCliente = document.getElementById('cliente');
        selectCliente.innerHTML = '<option value="">Selecione</option>';
        listaClientes.forEach(c => {
            selectCliente.innerHTML += `<option value="${c.id}" data-sigla="${c.sigla}">${c.nome} (${c.sigla})</option>`;
        });

        // Preenche o Select de Tipos de Ponto
        const selectTipo = document.getElementById('tipo_ponto');
        selectTipo.innerHTML = '<option value="">Selecione</option>';
        listaTipos.forEach(t => {
            selectTipo.innerHTML += `<option value="${t.id}" data-sigla="${t.sigla}">${t.nome} (${t.sigla})</option>`;
        });
        
        // Reseta os selects dependentes de hierarquia
        document.getElementById('unidade').innerHTML = '<option value="">Selecione</option>';
        document.getElementById('area').innerHTML = '<option value="">Selecione</option>';
        
        console.log('Dados reais carregados com sucesso do banco!');
        
    } catch (error) {
        console.error("Erro de conexão ao carregar opções:", error);
        document.getElementById('cliente').innerHTML = '<option value="">Erro de conexão</option>';
        document.getElementById('tipo_ponto').innerHTML = '<option value="">Erro de conexão</option>';
    }
}

// 2. Filtra as Unidades baseadas no Cliente escolhido
function filtrarUnidades() {
    const clienteId = document.getElementById('cliente').value;
    const selectUnidade = document.getElementById('unidade');
    
    // Limpa os selects dependentes
    selectUnidade.innerHTML = '<option value="">Selecione</option>';
    document.getElementById('area').innerHTML = '<option value="">Selecione</option>';
    document.getElementById('codigo-gerado').innerHTML = '';
    removerQRCode();

    if (!clienteId) {
        console.log('Nenhum cliente selecionado');
        return;
    }

    // Filtra unidades pelo cliente
    const unidadesFiltradas = listaUnidades.filter(u => u.cliente_id == clienteId);
    
    if (unidadesFiltradas.length === 0) {
        selectUnidade.innerHTML = '<option value="">Nenhuma unidade disponível</option>';
        return;
    }
    
    unidadesFiltradas.forEach(u => {
        selectUnidade.innerHTML += `<option value="${u.id}" data-sigla="${u.sigla}">${u.nome}</option>`;
    });
    
    console.log(`Unidades carregadas: ${unidadesFiltradas.length}`);
}

// 3. Filtra as Áreas baseadas na Unidade (Planta) escolhida
function filtrarAreas() {
    const unidadeId = document.getElementById('unidade').value;
    const selectArea = document.getElementById('area');
    
    // Limpa o select de área
    selectArea.innerHTML = '<option value="">Selecione</option>';
    document.getElementById('codigo-gerado').innerHTML = '';
    removerQRCode();

    if (!unidadeId) {
        console.log('Nenhuma unidade selecionada');
        return;
    }

    // Filtra áreas pela unidade
    const areasFiltradas = listaAreas.filter(a => a.unidade_id == unidadeId);
    
    if (areasFiltradas.length === 0) {
        selectArea.innerHTML = '<option value="">Nenhuma área disponível</option>';
        return;
    }
    
    areasFiltradas.forEach(a => {
        selectArea.innerHTML += `<option value="${a.id}" data-sigla="${a.sigla}">${a.nome} (${a.sigla})</option>`;
    });
    
    console.log(`Áreas carregadas: ${areasFiltradas.length}`);
}

async function gerarCodigoPreview() {
    const clienteId = document.getElementById('cliente').value;
    const unidadeId = document.getElementById('unidade').value;
    const areaId = document.getElementById('area').value;
    const tipoId = document.getElementById('tipo_ponto').value;
    
    // Verifica se todos os campos estão selecionados
    if (!clienteId || !unidadeId || !areaId || !tipoId) {
        document.getElementById('codigo-gerado').innerHTML = 
            '<span style="color: #999;">Selecione todos os campos para gerar o código</span>';
        return;
    }
    
    try {
        // Consulta no banco o próximo número incremental disponível
        const res = await fetch(`http://localhost:3000/api/pontos/proximo-numero?area_id=${areaId}&tipo_ponto_id=${tipoId}`);
        
        if (!res.ok) {
            console.error('Erro ao buscar próximo número no servidor');
            document.getElementById('codigo-gerado').innerHTML = 
                '<span style="color: #e74c3c;">Erro ao gerar código</span>';
            return;
        }
        
        const dados = await res.json();
        
        // Recupera as siglas correspondentes nas listas locais
        const cliente = listaClientes.find(c => c.id == clienteId);
        const area = listaAreas.find(a => a.id == areaId);
        const tipo = listaTipos.find(t => t.id == tipoId);
        
        if (!cliente || !area || !tipo) {
            console.error('Configurações de siglas correspondentes não encontradas');
            document.getElementById('codigo-gerado').innerHTML = 
                '<span style="color: #e74c3c;">Dados de configuração não encontrados</span>';
            return;
        }
        
        // Formata o número sequencial (ex: 1 vira "001") conforme retornado pela API
        const numeroFormatado = String(dados.proximo_numero || 1).padStart(3, '0');
        const codigo = `${cliente.sigla}-SPDA-${area.sigla}-${tipo.sigla}-${numeroFormatado}`;
        
        // Renderiza o preview em tela (azul) informando que aguarda o clique para salvar
        const divCodigo = document.getElementById('codigo-gerado');
        divCodigo.innerHTML = `
            <div style="color: #01257D; font-weight: bold; font-size: 1.2rem;">
                ${codigo}
            </div>
            <div style="font-size: 0.8rem; color: #777; margin-top: 4px;">
                🔄 Clique em "Salvar Ponto" para finalizar e gerar o QR Code
            </div>
        `;
        
    } catch (error) {
        console.error("Erro ao gerar preview do código:", error);
        document.getElementById('codigo-gerado').innerHTML = 
            '<span style="color: #e74c3c;">Erro de conexão ao gerar código</span>';
    }
}

async function salvarPonto(e) {
    e.preventDefault();

    const dadosEnvio = {
        cliente_id: Number(document.getElementById('cliente').value),
        area_id: Number(document.getElementById('area').value),
        tipo_ponto_id: Number(document.getElementById('tipo_ponto').value),
        localizacao: document.getElementById('localizacao').value,
        criticidade: document.getElementById('criticidade').value,
        descricao: document.getElementById('descricao').value,
        status: Number(document.getElementById('status').value) // Captura o valor Ativo (1) ou Inativo (0) para o banco
    };

    // Validação de campos obrigatórios no lado do cliente
    if (!dadosEnvio.cliente_id || !dadosEnvio.area_id || !dadosEnvio.tipo_ponto_id || !dadosEnvio.localizacao) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    try {
        // Realiza a requisição POST real para salvar os dados no banco via Prisma
        const res = await fetch('http://localhost:3000/api/pontos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosEnvio)
        });

        if (res.ok) {
            const pontoSalvo = await res.json();
            
            // Exibe o código único oficial e definitivo retornado pelo backend (em verde)
            const divCodigo = document.getElementById('codigo-gerado');
            divCodigo.innerText = pontoSalvo.codigo_unico;
            divCodigo.style.color = "green";
            divCodigo.style.fontWeight = "bold";
            divCodigo.style.fontSize = "1.2rem";
            
            // Renderiza o QR Code funcional integrado para consulta.html?ponto=CODIGO
            if (pontoSalvo.codigo_unico) {
                removerQRCode();
                const container = criarContainerQR(pontoSalvo.codigo_unico);
                divCodigo.parentNode.insertBefore(container, divCodigo.nextSibling);
                gerarQRCode(pontoSalvo.codigo_unico);
            }
            
            alert('Ponto cadastrado com sucesso no banco de dados!');
            
            // Limpa os campos de texto do formulário para permitir novos registros
            document.getElementById('localizacao').value = '';
            document.getElementById('descricao').value = '';
            document.getElementById('observacao').value = '';
            document.getElementById('criticidade').value = '';
            document.getElementById('status').value = '';
            
        } else {
            const erro = await res.json();
            alert(`Erro ao cadastrar no banco de dados: ${erro.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error("Erro de conexão ao salvar ponto:", error);
        alert('Erro de conexão com o servidor backend.');
    }
}