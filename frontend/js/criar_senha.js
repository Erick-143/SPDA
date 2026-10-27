document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('form-criar-senha');
    const emailInput = document.getElementById('email-novo');
    const senhaInput = document.getElementById('senha-nova');
    const btnSalvar = document.getElementById('btnSalvar');
    const msgRetorno = document.getElementById('msg-retorno');

function mostrarMensagem(texto, tipo) {
   const iconSrc = tipo === 'erro' ? './assets/imagem-ficha/x.png' : './assets/imagem-ficha/check.png';
    
    msgRetorno.innerHTML = `<img src="${iconSrc}" class="msg-icon" alt="status"> ${texto}`;
    msgRetorno.className = tipo;
}

    function limparMensagem() {
        msgRetorno.textContent = '';
        msgRetorno.className = '';
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Limpa mensagem anterior
        limparMensagem();

        // Pega valores
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!email || !senha) {
            mostrarMensagem('Preencha todos os campos.', 'erro');
            return;
        }

        if (senha.length < 6) {
            mostrarMensagem('A senha deve ter pelo menos 6 caracteres.', 'erro');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            mostrarMensagem('Digite um e-mail válido.', 'erro');
            return;
        }

        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Salvando...';

        try {
            const res = await fetch('http://localhost:3000/api/auth/criar-senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    novaSenha: senha
                })
            });

            const respostaJson = await res.json();

            if (res.ok) {
                mostrarMensagem('Senha criada com sucesso! Redirecionando...', 'sucesso');
                btnSalvar.textContent = 'Salvo!';

                // Redireciona após 2 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } else {
                mostrarMensagem('' + (respostaJson.erro || 'Erro ao criar senha.'), 'erro');
                btnSalvar.disabled = false;
                btnSalvar.textContent = 'Salvar Senha';
            }

        } catch (error) {
            mostrarMensagem('353453Erro de conexão com o servidor.', 'erro');
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'Salvar Senha';
            console.error('Erro:', error);
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const active = document.activeElement;
            if (active === emailInput || active === senhaInput) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });

    emailInput.addEventListener('input', limparMensagem);
    senhaInput.addEventListener('input', limparMensagem);

});