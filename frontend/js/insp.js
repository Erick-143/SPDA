document.addEventListener('DOMContentLoaded', async () => {
    // 1. Preenche o campo de data automaticamente com a data de hoje
    document.getElementById('data_inspecao').valueAsDate = new Date();

    // 2. Busca a lista de pontos no banco de dados e preenche o <select>
    await carregarPontos();

    // 3. Captura o código do ponto vindo da URL (se o usuário veio do Scanner ou da Ficha)
    const urlParams = new URLSearchParams(window.location.search);
    const codigoPonto = urlParams.get('codigo_ponto');

    if (codigoPonto) {
        selecionarPontoNaLista(codigoPonto);
    }

    // 4. Configura o envio do formulário
    document.getElementById('form-nova-inspecao').addEventListener('submit', salvarInspecao);
});

async function carregarPontos() {
    try {
        const res = await fetch('http://localhost:3000/api/pontos');
        const pontos = await res.json();
        
        const select = document.getElementById('ponto_spda');
        select.innerHTML = '<option value="">-- Selecione o ponto que será inspecionado --</option>';

        pontos.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id; 
            option.dataset.codigo = p.codigo_unico; 
            option.textContent = `${p.codigo_unico} (${p.tipo_ponto?.nome || 'Ponto'} - ${p.area?.nome || 'Área'})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar pontos:", error);
        document.getElementById('ponto_spda').innerHTML = '<option value="">Erro ao conectar com o servidor.</option>';
    }
}

function selecionarPontoNaLista(codigo) {
    const select = document.getElementById('ponto_spda');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].dataset.codigo === codigo) {
            select.selectedIndex = i;
            break;
        }
    }
}

async function salvarInspecao(e) {
    e.preventDefault();

    // Reúne todos os dados do formulário
    const dadosInspecao = {
        ponto_id: parseInt(document.getElementById('ponto_spda').value),
        data_inspecao: document.getElementById('data_inspecao').value,
        condicao_visual: document.getElementById('condicao_visual').value,
        continuidade_eletrica: parseFloat(document.getElementById('continuidade').value) || null,
        resistencia_aterramento: parseFloat(document.getElementById('resistencia').value) || null,
        oxidacao: document.getElementById('oxidacao').value === "1",
        conformidade: document.getElementById('conformidade').value === "1",
        necessidade_correcao: document.getElementById('necessidade-correcao').value === "1",
        observacoes: document.getElementById('observacoes').value,
        
        //acho que o erro ta aqui, o id unico fixo ai tem que conectar na tabela ainda 
        usuario_id: 1, 
        responsavel_digitado: document.getElementById('responsavel').value
    };

    try {
        const res = await fetch('http://localhost:3000/api/inspecoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosInspecao)
        });

        if (res.ok) {
            alert('Inspeção registrada com sucesso!');
            // Redireciona de volta para a ficha do ponto atualizado
            const codigoPonto = document.getElementById('ponto_spda').options[document.getElementById('ponto_spda').selectedIndex].dataset.codigo;
            window.location.href = `ficha_ponto.html?codigo=${codigoPonto}`;
        } else {
            const erro = await res.json();
            alert(`Erro ao registrar: ${erro.erro || 'Verifique os dados.'}`);
        }
    } catch (error) {
        console.error("Erro:", error);
        alert('Erro de conexão ao salvar inspeção.');
    }
}

function limparFormulário() {
    document.getElementById('form-nova-inspecao').reset();
    document.getElementById('data_inspecao').valueAsDate = new Date();
}