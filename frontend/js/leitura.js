class QRCodeScanner {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.isProcessing = false;
        
        // Elementos do DOM
        this.areaScanner = document.getElementById('leitura');
        this.areaResultado = document.getElementById('resultado');
        this.carregarCamera = document.getElementById('carrega-camera');
        this.manualBtn = document.getElementById('btn-ent-manual');
        this.restartBtn = document.getElementById('reload-btn-scanner');
    }

    async init() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('Seu navegador não suporta acesso à câmera.');
            return;
        }

        this.carregarCamera.style.display = 'block';
        this.setupEventListeners();

        try {
            await this.startScanner();
        } catch (error) {
            console.error('Erro ao iniciar scanner:', error);
            this.showError('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    }

    async startScanner() {
        console.log("Iniciando scanner...");
        try {
            // Esconde resultados anteriores e botões de recarregar
            this.areaResultado.style.display = 'none';
            this.restartBtn.style.display = 'none';
            this.isProcessing = false;

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            // Recria a instância se necessário
            if (!this.html5QrCode) {
                this.html5QrCode = new Html5Qrcode("leitura");
            }

            await this.html5QrCode.start(
                { facingMode: "environment" }, 
                config, 
                this.onScanSuccess.bind(this), 
                (error) => { /* Erros de leitura contínuos (foco, luz) são ignorados */ }
            );

            this.isScanning = true;
            console.log("Scanner iniciado com sucesso.");
            this.carregarCamera.style.display = 'none';
        } catch (error) {
            console.error("ERRO DETALHADO NO SCANNER:", error);
            this.showError('Erro ao acessar a câmera: ' + error.message);
        }
    }

    // Função para extrair apenas o código do ponto caso o QR traga uma URL completa
    extrairCodigoPonto(textoLido) {
        try {
            // Tenta tratar como URL (ex: http://site.com/consulta.html?ponto=RZ-SPDA-TQ-CI-001)
            const url = new URL(textoLido);
            return url.searchParams.get('ponto') || textoLido;
        } catch (e) {
            // Se der erro, significa que não é uma URL, então retorna o texto puro
            return textoLido;
        }
    }

    async onScanSuccess(decodedText, decodedResult) {
        if (this.isProcessing) return; // Evita múltiplas leituras simultâneas
        this.isProcessing = true;

        // 1. Para a câmera imediatamente após ler
        await this.stopScanner();

        // 2. Extrai o código limpo
        const codigoLimpo = this.extrairCodigoPonto(decodedText.trim());

        if (!codigoLimpo) {
            this.showFeedback('Código QR inválido ou vazio.', 'error');
            this.restartBtn.style.display = 'inline-flex';
            this.isProcessing = false;
            return;
        }

        // 3. Valida no banco de dados
        await this.validarEProcessarPonto(codigoLimpo);
    }

    async validarEProcessarPonto(codigo) {
        this.showFeedback(`⏳ Verificando ponto: <br><span class="ponto-id">${codigo}</span>`, 'success');

        try {
            // Bate na sua API para verificar se o ponto existe
            // ATENÇÃO: Certifique-se de que essa rota existe no seu backend!
            const res = await fetch(`http://localhost:3000/api/pontos/buscar-codigo/${codigo}`);

            if (res.ok) {
                // Ponto existe!
                this.showFeedback(`✅ Ponto encontrado! Redirecionando... <br><span class="ponto-id">${codigo}</span>`, 'success');
                
                // Redireciona após 1.5 segundos (para o usuário conseguir ler a mensagem)
                setTimeout(() => {
                    window.location.href = `nova_insp.html?codigo_ponto=${encodeURIComponent(codigo)}`;
                }, 1500);
            } else {
                // Ponto não existe
                this.showFeedback(`❌ Ponto não encontrado no banco de dados. <br><span class="ponto-id">${codigo}</span>`, 'error');
                this.restartBtn.style.display = 'inline-flex'; // Mostra botão de tentar de novo
            }
        } catch (error) {
            console.error("Erro na validação do banco:", error);
            this.showFeedback('⚠️ Erro de conexão com o servidor. Verifique se o backend está rodando.', 'error');
            this.restartBtn.style.display = 'inline-flex';
        } finally {
            this.isProcessing = false;
        }
    }

    showFeedback(mensagem, tipo) {
        this.areaResultado.style.display = 'block';
        this.areaResultado.className = tipo === 'success' ? 'scan-success' : 'scan-error';
        this.areaResultado.innerHTML = mensagem;
    }

    showError(message) {
        this.areaScanner.innerHTML = `<p style="color: red; padding: 20px; font-weight: bold;">${message}</p>`;
        this.carregarCamera.style.display = 'none';
    }

    setupEventListeners() {
        // Botão de inserir manualmente
        if (this.manualBtn) {
            this.manualBtn.addEventListener('click', async () => {
                const manualId = prompt('Digite o código do ponto SPDA manualmente (Ex: RZ-SPDA-TQ-CI-001):');
                if (manualId && manualId.trim()) {
                    await this.stopScanner(); // Para a câmera se estiver rodando
                    this.isProcessing = true;
                    await this.validarEProcessarPonto(manualId.trim().toUpperCase());
                }
            });
        }

        // Botão de tentar novamente em caso de erro
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                this.startScanner(); // Reinicia a câmera
            });
        }
    }

    async stopScanner() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.isScanning = false;
                console.log("Câmera pausada.");
            } catch (err) {
                console.error("Erro ao pausar câmera:", err);
            }
        }
    }
}

// Inicializa a classe assim que a tela carregar
document.addEventListener('DOMContentLoaded', () => {
    const scanner = new QRCodeScanner();
    scanner.init();
});