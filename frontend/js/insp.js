let listaDePontos = [];

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

    // Novo evento: Mostrar resumo quando usuário mudar o select manualmente
    document.getElementById('ponto_spda').addEventListener('change', mostrarResumoPonto);
});

async function carregarPontos() {
    try {
        const res = await fetch('http://localhost:3000/api/pontos');
        listaDePontos = await res.json();

        const select = document.getElementById('ponto_spda');
        select.innerHTML = '<option value="">-- Selecione o ponto que será inspecionado --</option>';

        listaDePontos.forEach(p => {
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
            mostrarResumoPonto(); // <--- Chama o resumo aqui para mostrar logo ao abrir da câmera!
            break;
        }
    }
}

async function salvarInspecao(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append('ponto_id', document.getElementById('ponto_spda').value);
    formData.append('data_inspecao', document.getElementById('data_inspecao').value);
    formData.append('responsavel', document.getElementById('responsavel').value); // NOVO
    formData.append('condicao_visual', document.getElementById('condicao_visual').value);
    formData.append('continuidade_eletrica', document.getElementById('continuidade').value);
    formData.append('resistencia_aterramento', document.getElementById('resistencia').value);
    formData.append('oxidacao', document.getElementById('oxidacao').value === "1");
    formData.append('conformidade', document.getElementById('conformidade').value === "1");
    formData.append('necessidade_correcao', document.getElementById('necessidade-correcao').value === "1");
    formData.append('observacoes', document.getElementById('observacoes').value);
    formData.append('usuario_id', localStorage.getItem('usuario_id') || 1);

    const fotoInput = document.getElementById('foto_inspecao');
    if (fotoInput.files.length > 0) {
        formData.append('foto', fotoInput.files[0]);
    }

    try {
        const res = await fetch('http://localhost:3000/api/inspecoes', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert('✅ Inspeção registrada com sucesso!');
            const selectPonto = document.getElementById('ponto_spda');
            const codigoPonto = selectPonto.options[selectPonto.selectedIndex].dataset.codigo;
            window.location.href = `ficha_ponto.html?codigo=${codigoPonto}`;
        } else {
            alert('❌ Erro: ' + (data.erro || 'Verifique os dados.'));
        }
    } catch (error) {
        console.error("Erro:", error);
        alert('❌ Erro de conexão ao salvar inspeção.');
    }
}

function limparFormulário() {
    document.getElementById('form-nova-inspecao').reset();
    document.getElementById('data_inspecao').valueAsDate = new Date();
    document.getElementById('resumo_ponto').style.display = 'none';
}

// --- LÓGICA DO RESUMO DINÂMICO ---
function mostrarResumoPonto() {
    const select = document.getElementById('ponto_spda');
    const idSelecionado = parseInt(select.value);
    const boxResumo = document.getElementById('resumo_ponto');

    if (!idSelecionado) {
        boxResumo.style.display = 'none';
        return;
    }

    // Procura o ponto na nossa lista usando o ID
    const ponto = listaDePontos.find(p => p.id === idSelecionado);

    if (ponto) {
        boxResumo.style.display = 'block';
        boxResumo.innerHTML = `

    <strong style="color: #333;">Detalhes do Ponto:</strong><br>
    <span style="font-size: 0.95rem; color: #555; display: flex; flex-direction: column; gap: 4px;">
        <span><img src="./assets/imagem-insp/cliente.png" alt="Cliente" width="16" height="16" style="vertical-align: middle;" /> <b>Cliente:</b> ${ponto.cliente?.nome || 'N/A'}</span>
        <span><img src="./assets/imagem-insp/unidade.png" alt="Unidade" width="16" height="16" style="vertical-align: middle;" /> <b>Unidade:</b> ${ponto.unidade?.nome || 'N/A'}</span>
        <span><img src="./assets/imagem-insp/area.png" alt="Área" width="16" height="16" style="vertical-align: middle;" /> <b>Área:</b> ${ponto.area?.nome || 'N/A'}</span>
        <span><img src="./assets/imagem-insp/map-pin.png" alt="Localização" width="16" height="16" style="vertical-align: middle;" /> <b>Localização:</b> ${ponto.localizacao || 'Sem descrição exata'}</span>
    </span>
`;
    }
}
