// Variáveis globais para guardar a lista e filtrar sem travar o servidor
let listaUnidades = [];
let listaAreas = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarOpcoes();
    
    // Os "espiões" que percebem quando o Gestor muda a opção no clique
    document.getElementById('cliente').addEventListener('change', filtrarUnidades);
    document.getElementById('unidade').addEventListener('change', filtrarAreas);
    
    // Intercepta o botão salvar
    document.getElementById('form-cadastro-ponto').addEventListener('submit', salvarPonto);
});

// 1. Carrega tudo do banco ao abrir a página
async function carregarOpcoes() {
    try {
        const res = await fetch('http://localhost:3000/api/auxiliar/dados-cadastro');
        const dados = await res.json();
        
        listaUnidades = dados.unidades;
        listaAreas = dados.areas;

        const selectCliente = document.getElementById('cliente');
        dados.clientes.forEach(c => {
            selectCliente.innerHTML += `<option value="${c.id}">${c.nome} (${c.sigla})</option>`;
        });

        const selectTipo = document.getElementById('tipo_ponto');
        dados.tipos.forEach(t => {
            selectTipo.innerHTML += `<option value="${t.id}">${t.nome} (${t.sigla})</option>`;
        });
        
    } catch (error) {
        console.error("Erro ao carregar opções:", error);
    }
}

// 2. Filtra as Unidades baseadas no Cliente escolhido
function filtrarUnidades() {
    const clienteId = document.getElementById('cliente').value;
    const selectUnidade = document.getElementById('unidade');
    
    // Reseta Unidade e Área se o cara mudar de ideia no Cliente
    selectUnidade.innerHTML = '<option value="">Selecione</option>';
    document.getElementById('area').innerHTML = '<option value="">Selecione</option>';

    if (!clienteId) return;

    // Filtra as plantas (unidades) pertencentes ao Cliente ID
    const unidadesFiltradas = listaUnidades.filter(u => u.cliente_id == clienteId);
    
    unidadesFiltradas.forEach(u => {
        selectUnidade.innerHTML += `<option value="${u.id}">${u.nome}</option>`;
    });
}

// 3. Filtra as Áreas baseadas na Unidade (Planta) escolhida
function filtrarAreas() {
    const unidadeId = document.getElementById('unidade').value;
    const selectArea = document.getElementById('area');
    
    selectArea.innerHTML = '<option value="">Selecione</option>';

    if (!unidadeId) return;

    // Filtra os locais pertencentes àquela Unidade
    const areasFiltradas = listaAreas.filter(a => a.unidade_id == unidadeId);
    
    areasFiltradas.forEach(a => {
        selectArea.innerHTML += `<option value="${a.id}">${a.nome} (${a.sigla})</option>`;
    });
}

// 4. Salva o ponto e recebe de volta o Código Único Gerado
async function salvarPonto(e) {
    e.preventDefault();

    const dadosEnvio = {
        cliente_id: Number(document.getElementById('cliente').value),
        area_id: Number(document.getElementById('area').value),
        tipo_ponto_id: Number(document.getElementById('tipo_ponto').value),
        localizacao: document.getElementById('localizacao').value,
        criticidade: document.getElementById('criticidade').value,
        descricao: document.getElementById('descricao').value
    };

    try {
        const res = await fetch('http://localhost:3000/api/pontos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosEnvio)
        });

        if (res.ok) {
            const pontoSalvo = await res.json();
            
            // Exibe a mágica: O Código Automático (Ex: RZ-SPDA-TQ-CI-001)
            const divCodigo = document.getElementById('codigo-gerado');
            divCodigo.innerText = pontoSalvo.codigo_unico;
            divCodigo.style.color = "green";
            divCodigo.style.fontWeight = "bold";
            divCodigo.style.fontSize = "1.2rem";
            
            alert('Ponto cadastrado com sucesso!');
        } else {
            alert('Erro ao cadastrar o ponto.');
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
    }
}
