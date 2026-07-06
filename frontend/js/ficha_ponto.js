document.addEventListener('DOMContentLoaded', () => {
    // 1. Captura o parâmetro "codigo" vindo da URL (ex: ?codigo=RZ-SPDA-TQ-CI-001)
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
        // 2. Consulta a rota buscarPorCodigo do backend
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

        // 3. Preenche os dados básicos e características do Ponto
        document.getElementById('ponto-codigo').innerText = ponto.codigo_unico;

        // --- Renderiza o QR Code dinamicamente na ficha ---
        if (ponto.codigo_unico) {
            const container = criarContainerQR(ponto.codigo_unico);
            // Insere ao final da div destaque-container, depois das badges
            document.querySelector('.destaque-container').appendChild(container);
            gerarQRCode(ponto.codigo_unico);
        }
        // -----------------------------------------------------------
        document.getElementById('ponto-area').innerText = `${ponto.area?.nome || '---'} (${ponto.area?.sigla || ''})`;
        document.getElementById('ponto-unidade').innerText = ponto.unidade?.nome || 'Planta Principal';
        document.getElementById('ponto-localizacao').innerText = ponto.localizacao || 'Sem descrição cadastrada';

        document.getElementById('ponto-tipo').innerText = `${ponto.tipo_ponto?.nome || '---'} (${ponto.tipo_ponto?.sigla || ''})`;
        document.getElementById('ponto-cliente').innerText = `${ponto.cliente?.nome || '---'} (${ponto.cliente?.sigla || ''})`;

        const campoCriticidade = document.getElementById('ponto-criticidade');
        campoCriticidade.innerText = ponto.criticidade || 'Baixa';
        if (ponto.criticidade === 'Alta') {
            campoCriticidade.style.color = 'var(--vermelho-nao-conforme)';
        } else if (ponto.criticidade === 'Media') {
            campoCriticidade.style.color = 'var(--amarelo-alerta)';
        } else {
            campoCriticidade.style.color = 'var(--verde-conforme)';
        }

        // 4. Renderiza as Inspeções (Histórico e Última Medição)
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

    if (inspecoes.length > 0) {
        // Ordena por data mais recente 
        inspecoes.sort((a, b) => new Date(b.data_inspecao) - new Date(a.data_inspecao));

        // 1. Alimenta o card da "Última Medição" com a inspeção mais recente (posição 0)
        const ultima = inspecoes[0];
        document.getElementById('medicao-data').innerText = new Date(ultima.data_inspecao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        document.getElementById('medicao-continuidade').innerText = ultima.continuidade_eletrica !== null ? ultima.continuidade_eletrica : '---';
        document.getElementById('medicao-resistencia').innerText = ultima.resistencia_aterramento !== null ? ultima.resistencia_aterramento : '---';
        document.getElementById('medicao-visual').innerText = ultima.condicao_visual || '---';

        // 2. Preenche as linhas da tabela de Histórico
        inspecoes.forEach(insp => {
            const tr = document.createElement('tr');

            // Tratamento do status
            const isConforme = insp.conformidade === true;
            const statusTexto = isConforme ? 'Conforme' : 'Não Conforme';
            const statusClass = isConforme ? 'conforme' : 'nao-conforme';

            if (!isConforme) {
                tr.style.background = '#fff5f5';
            }

            // Tratamento do Responsável + tratamento de erro
            const responsavel = insp.usuarios ? insp.usuarios.nome : `Equipe ${insp.usuario_id}`;

            tr.innerHTML = `
                <td><strong>${new Date(insp.data_inspecao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong></td>
                <td>${responsavel}</td>
                <td ${!isConforme ? 'style="color: var(--vermelho-nao-conforme); font-weight: 600;"' : ''}>${insp.continuidade_eletrica !== null ? insp.continuidade_eletrica : '---'}</td>
                <td ${!isConforme ? 'style="color: var(--vermelho-nao-conforme); font-weight: 600;"' : ''}>${insp.resistencia_aterramento !== null ? insp.resistencia_aterramento : '---'}</td>
                <td>${insp.condicao_visual || 'Boa'}</td>
                <td>
                    <span class="bolinha-status ${statusClass}"></span> 
                    <span ${!isConforme ? 'style="color: var(--vermelho-nao-conforme); font-weight: 700;"' : ''}>${statusTexto}</span>
                </td>
            `;
            corpoTabela.appendChild(tr);
        });

    } else {
        document.getElementById('medicao-data').innerText = 'Nenhuma realizada';
        document.getElementById('medicao-continuidade').innerText = '---';
        document.getElementById('medicao-resistencia').innerText = '---';
        document.getElementById('medicao-visual').innerText = '---';

        corpoTabela.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #777; padding: 20px;">
                    Este ponto de SPDA ainda não possui nenhuma inspeção registrada.
                </td>
            </tr>
        `;
    }

    // 5. Constrói a seção de Badges dinâmicas
    const statusContainer = document.getElementById('ponto-status-container');
    const pontoStatusTexto = statusPonto === false ? 'Inativo' : 'Ativo';
    const pontoStatusBadge = statusPonto === false ? 'nao-conforme' : 'ativo';
    const pontoStatusIcon = statusPonto === false ? 'shield-x.png' : 'shield-alert.png';

    let conformidadeTexto = 'Sem Insp.';
    let conformidadeBadge = 'ativo';
    let conformidadeIcon = 'info.png';

    if (inspecoes.length > 0) {
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

//Gera o PDF de forma semelhante a impressão
function gerarPDF() {
    window.print();
}