// Variável global para armazenar os pontos vindos do banco
let todosOsPontos = [];

document.addEventListener('DOMContentLoaded', () => {
    buscarPontosDoBanco();
    
    // Adiciona ouvintes reativos para filtrar automaticamente assim que mudar a opção
    document.getElementById('filtro-busca').addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-area').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-status').addEventListener('change', aplicarFiltros);
});

// 1. Busca os dados reais do seu backend (Prisma)
async function buscarPontosDoBanco() {
    try {
        const res = await fetch('http://localhost:3000/api/pontos');
        
        if (!res.ok) {
            throw new Error('Erro na resposta da API');
        }
        
        todosOsPontos = await res.json();
        
        popularFiltrosDinamicos(todosOsPontos);
        renderizarGrid(todosOsPontos);
        
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        const grid = document.getElementById('grid-pontos');
        grid.innerHTML = `
            <div class="empty-state">
                <h3 style="color: var(--cor-erro);">⚠️ Erro ao conectar com o servidor.</h3>
                <p>Verifique se o backend está rodando na porta 3000.</p>
            </div>
        `;
    }
}

// 2. Extrai os dados únicos existentes e reconstrói as opções dos Filtros
function popularFiltrosDinamicos(pontos) {
    const selectArea = document.getElementById('filtro-area');
    const selectTipo = document.getElementById('filtro-tipo');

    const areasExistentes = new Map();
    const tiposExistentes = new Map();

    pontos.forEach(p => {
        if (p.area && p.area.sigla) {
            areasExistentes.set(p.area.sigla.toUpperCase(), p.area.nome);
        }
        if (p.tipo_ponto && p.tipo_ponto.sigla) {
            tiposExistentes.set(p.tipo_ponto.sigla.toUpperCase(), p.tipo_ponto.nome);
        }
    });

    selectArea.innerHTML = '<option value="">Todas</option>';
    areasExistentes.forEach((nome, sigla) => {
        selectArea.innerHTML += `<option value="${sigla}">${nome} (${sigla})</option>`;
    });

    selectTipo.innerHTML = '<option value="">Todos</option>';
    tiposExistentes.forEach((nome, sigla) => {
        selectTipo.innerHTML += `<option value="${sigla}">${nome} (${sigla})</option>`;
    });
}

// 3. Transforma os dados do banco em Cards HTML 
function renderizarGrid(pontos) {
    const grid = document.getElementById('grid-pontos');
    grid.innerHTML = ''; 

    if (pontos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum ponto encontrado com os filtros atuais.</h3>
            </div>
        `;
        return;
    }

    pontos.forEach(ponto => {
        let statusClass = 'ativo';
        let statusTexto = 'Ativo';
        
        if (ponto.status === 0) {
            statusClass = 'nao-conforme'; 
            statusTexto = 'Inativo';
        }

        const cardHTML = `
            <div class="card-ponto status-${statusClass}">
                <div class="card-header">
                    <div class="card-codigo">${ponto.codigo_unico}</div>
                </div>
                
                <div class="card-body">
                    <div class="card-info">
                        <span title="Cliente">
                            <img src="./assets/imagem-listagem/building-2.png" alt="Cliente" width="16" height="16">
                            <strong>${ponto.cliente?.nome || 'Não inf.'}</strong>
                        </span>
                        
                        <span title="Área">
                            <img src="./assets/imagem-listagem/land-plot.png" alt="Área" width="16" height="16">
                            ${ponto.area?.nome || 'Sem área'}
                        </span>
                        
                        <span title="Tipo">
                            <img src="./assets/imagem-listagem/signpost-big.png" alt="Tipo" width="16" height="16">
                            ${ponto.tipo_ponto?.nome || 'Outro'}
                        </span>
                        
                        <span title="Localização" style="width: 100%;">
                            <img src="./assets/imagem-listagem/map-pin.png" alt="Localização" width="16" height="16">
                            ${ponto.localizacao || 'Sem descrição exata'}
                        </span>
                    </div>
                </div>
                
                <div class="card-footer">
                    <span class="status-badge ${statusClass}">${statusTexto}</span>
                    
                    <a href="ficha_ponto.html?codigo=${ponto.codigo_unico}" class="btn-visualizar">
                        <img src="./assets/imagem-listagem/eye.png" alt="Visualizar" width="14" height="14">
                        Visualizar
                    </a>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

// 4. Lógica de Filtragem Reativa e Precisa
function aplicarFiltros() {
    const busca = document.getElementById('filtro-busca').value.toLowerCase().trim();
    const areaFiltro = document.getElementById('filtro-area').value.toUpperCase();
    const tipoFiltro = document.getElementById('filtro-tipo').value.toUpperCase();
    const statusFiltro = document.getElementById('filtro-status').value.toLowerCase();

    const pointsFiltrados = todosOsPontos.filter(ponto => {
        const bateBusca = 
            ponto.codigo_unico.toLowerCase().includes(busca) || 
            (ponto.localizacao && ponto.localizacao.toLowerCase().includes(busca));
        
        const siglaArea = ponto.area?.sigla?.toUpperCase() || '';
        const bateArea = areaFiltro === "" || siglaArea === areaFiltro;
        
        const siglaTipo = ponto.tipo_ponto?.sigla?.toUpperCase() || '';
        const bateTipo = tipoFiltro === "" || siglaTipo === tipoFiltro;
        
        let bateStatus = true;
        if (statusFiltro === 'ativo') {
            bateStatus = (ponto.status === 1 || ponto.status === null);
        } else if (statusFiltro === 'nao-conforme') {
            bateStatus = (ponto.status === 0);
        }

        return bateBusca && bateArea && bateTipo && bateStatus;
    });

    renderizarGrid(pointsFiltrados);
}