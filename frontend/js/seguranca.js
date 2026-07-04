// frontend/js/seguranca.js

// 1. Descobre quem está tentando acessar a página
const perfil = localStorage.getItem('perfil');
const paginaAtual = window.location.pathname.split('/').pop() || 'landingPage.html';

// 2. Páginas Públicas (Qualquer um acessa sem login)
const paginasPublicas = ['landingPage.html', 'login.html', 'inicio.html'];

// Se não está logado e tenta acessar página privada -> Chuta pro Login
if (!perfil && !paginasPublicas.includes(paginaAtual)) {
    window.location.href = 'login.html';
}
else if (perfil) {
    // 3. Regras de Ouro (Proteção de Acesso)

    // Lista de páginas que APENAS O GESTOR pode ver
    const paginasExclusivasGestor = [
        'painel_gestor.html',
        'cadastro_ponto.html',
        'configuracoes.html',
        'lista_pontos.html'
    ];

    // Se um Inspetor tentar invadir uma página de Gestor:
    if (perfil === 'inspetor' && paginasExclusivasGestor.includes(paginaAtual)) {
        alert("🔒 Acesso Negado: Esta área é restrita a Gestores.");
        window.location.href = 'leitura.html'; // Joga ele de volta pra câmera
    }

    // Observação: O Gestor tem acesso livre a todas as telas (incluindo escanear e laudo)
}

// 4. Função global para o botão "Sair"
function realizarLogout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// 5. Configurar o Mini Perfil Dinâmico em todas as páginas
document.addEventListener('DOMContentLoaded', () => {
    // Procura os elementos visuais no HTML
    const userNameElement = document.getElementById('user-name');
    const userAvatarElement = document.querySelector('.usuario-avatar img');
    const usuarioDiv = document.querySelector('.usuario');

    // Troca o texto estático pelo Nome que veio do Google
    if (userNameElement && localStorage.getItem('nomeUsuario')) {
        // Pega só o primeiro nome para o layout não quebrar
        const primeiroNome = localStorage.getItem('nomeUsuario').split(' ')[0];
        userNameElement.innerText = primeiroNome;
    }

    // Troca a foto genérica pela foto do Google
    if (userAvatarElement && localStorage.getItem('fotoPerfil') && localStorage.getItem('fotoPerfil') !== "undefined") {
        userAvatarElement.src = localStorage.getItem('fotoPerfil');
        userAvatarElement.style.borderRadius = "50%"; // Deixa redondinha
    }

    // Transforma toda a área do perfil num botão de Sair seguro (Logout)
    if (usuarioDiv) {
        usuarioDiv.style.cursor = 'pointer';
        usuarioDiv.title = "Clique para sair do sistema";

        usuarioDiv.addEventListener('click', () => {
            const desejaSair = confirm("Deseja realmente sair do Leitor SPDA?");
            if (desejaSair) {
                realizarLogout();
            }
        });
    }
});
