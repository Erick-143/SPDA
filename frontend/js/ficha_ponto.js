document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoPonto = urlParams.get('codigo');

    if (!codigoPonto) {
        alert('Código do ponto de SPDA não informado na URL.');
        window.location.href = 'lista_pontos.html';
        return;
    }

    carregarDadosDaFicha(codigoPonto);
});

async function carregarDadosDaFicha(codigo) {
    try {
        const res = await fetch(`http://localhost:3000/api/pontos/buscar-codigo/${codigo}`);

        if (!res.ok) {
            if (res.status === 404) {
                alert('Ponto de SPDA não encontrado no banco de dados.');
            } else {
                alert('Erro ao carregar dados do ponto.');
            }
            window.location.href = 'lista_pontos.html';
            return;
        }

        const ponto = await res.json();

        document.getElementById('ponto-codigo').innerText = ponto.codigo_unico;

        if (ponto.codigo_unico) {
            const container = criarContainerQR(ponto.codigo_unico);
            document.querySelector('.destaque-container').appendChild(container);
            gerarQRCode(ponto.codigo_unico);
        }

        document.getElementById('ponto-area').innerText = `${ponto.area?.nome || '---'} (${ponto.area?.sigla || ''})`;
        document.getElementById('ponto-unidade').innerText = ponto.unidade?.nome || 'Planta Principal';
        document.getElementById('ponto-localizacao').innerText = ponto.localizacao || 'Sem descrição cadastrada';
        document.getElementById('ponto-tipo').innerText = `${ponto.tipo_ponto?.nome || '---'} (${ponto.tipo_ponto?.sigla || ''})`;
        document.getElementById('ponto-cliente').innerText = `${ponto.cliente?.nome || '---'} (${ponto.cliente?.sigla || ''})`;

        const campoCriticidade = document.getElementById('ponto-criticidade');
        campoCriticidade.innerText = ponto.criticidade || 'Baixa';
        if (ponto.criticidade === 'Alta') {
            campoCriticidade.style.color = '#e74c3c';
        } else if (ponto.criticidade === 'Media') {
            campoCriticidade.style.color = '#f39c12';
        } else {
            campoCriticidade.style.color = '#27ae60';
        }

        const listaInspecoes = ponto.inspecoes || [];
        renderizarInspecoes(listaInspecoes, ponto.status, ponto.codigo_unico);

    } catch (error) {
        console.error('Erro de conexão ao carregar a ficha do ponto:', error);
        alert('Erro de conexão com o servidor backend.');
    }
}

function renderizarInspecoes(inspecoes, statusPonto, codigoPonto) {
    const corpoTabela = document.getElementById('corpo-tabela-historico');
    const totalRegistros = document.getElementById('total-registros');
    corpoTabela.innerHTML = '';

    totalRegistros.innerText = `Total: ${inspecoes.length} registros`;

    if (inspecoes.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #999;">Nenhuma inspeção registrada.</td></tr>';
        document.getElementById('medicao-data').innerText = '---';
        document.getElementById('medicao-continuidade').innerText = '---';
        document.getElementById('medicao-resistencia').innerText = '---';
        document.getElementById('medicao-visual').innerText = '---';
        atualizarBadges(inspecoes, statusPonto, codigoPonto);
        return;
    }

    inspecoes.sort((a, b) => new Date(b.data_inspecao) - new Date(a.data_inspecao));

    const ultima = inspecoes[0];
    document.getElementById('medicao-data').innerText = new Date(ultima.data_inspecao).toLocaleDateString('pt-BR');
    document.getElementById('medicao-continuidade').innerText = ultima.continuidade_eletrica !== null ? ultima.continuidade_eletrica : '---';
    document.getElementById('medicao-resistencia').innerText = ultima.resistencia_aterramento !== null ? ultima.resistencia_aterramento : '---';
    document.getElementById('medicao-visual').innerText = ultima.condicao_visual || '---';

    inspecoes.forEach(insp => {
        const tr = document.createElement('tr');
        const isConforme = insp.conformidade === true;
        const statusClass = isConforme ? 'status-conforme' : 'status-nao-conforme';
        const statusText = isConforme ? 'Conforme' : 'Não Conforme';
        const responsavel = insp.usuarios ? insp.usuarios.nome : `Equipe ${insp.usuario_id}`;

        tr.innerHTML = `
            <td>${new Date(insp.data_inspecao).toLocaleDateString('pt-BR')}</td>
            <td>${responsavel}</td>
            <td>${insp.continuidade_eletrica !== null ? insp.continuidade_eletrica : '---'}</td>
            <td>${insp.resistencia_aterramento !== null ? insp.resistencia_aterramento : '---'}</td>
            <td>${insp.condicao_visual || '---'}</td>
            <td class="${statusClass}">${statusText}</td>
        `;
        corpoTabela.appendChild(tr);
    });

    atualizarBadges(inspecoes, statusPonto, codigoPonto);
}

function atualizarBadges(inspecoes, statusPonto, codigoPonto) {
    const statusContainer = document.getElementById('ponto-status-container');

    const pontoStatusTexto = statusPonto === false ? 'Inativo' : 'Ativo';
    const pontoStatusBadge = statusPonto === false ? 'nao-conforme' : 'ativo';
    const pontoStatusIcon = statusPonto === false ? 'shield-x.png' : 'shield-alert.png';

    let conformidadeTexto = 'Sem Insp.';
    let conformidadeBadge = 'ativo';
    let conformidadeIcon = 'info.png';

    if (inspecoes && inspecoes.length > 0) {
        const isConforme = inspecoes[0].conformidade === true;
        conformidadeTexto = isConforme ? 'Conforme' : 'Não Conforme';
        conformidadeBadge = isConforme ? 'conforme' : 'nao-conforme';
        conformidadeIcon = isConforme ? 'check.png' : 'x.png';
    }

    statusContainer.innerHTML = `
        <span class="badge-grande ${conformidadeBadge}">
            <img src="./assets/imagem-ficha/${conformidadeIcon}" alt="status" width="20" height="20">
            ${conformidadeTexto}
        </span>
        <span class="badge-grande ${pontoStatusBadge}">
            <img src="./assets/imagem-ficha/${pontoStatusIcon}" alt="status" width="20" height="20">
            ${pontoStatusTexto}
        </span>
        <a href="nova_insp.html?codigo_ponto=${encodeURIComponent(codigoPonto)}" class="btn-nova-inspecao" id="btn-nova-insp">Nova Inspeção</a>
    `;
}

function gerarPDF() {
    window.print();
}