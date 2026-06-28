class QRCodeScanner {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.isProcessing = false;
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
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            this.html5QrCode = new Html5Qrcode("leitura");

            await this.html5QrCode.start(
                { facingMode: "environment" }, 
                config, 
                this.onScanSuccess.bind(this), 
                (error) => { /* Erros de leitura contínuos são ignorados */ }
            );

            console.log("Scanner iniciado com sucesso.");
            this.carregarCamera.style.display = 'none';
        } catch (error) {
            console.error("ERRO DETALHADO NO SCANNER:", error);
            this.showError('Erro ao acessar a câmera: ' + error.message);
        }
    }

    onScanSuccess(decodedText, decodedResult) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        this.html5QrCode.stop().then(() => {
            this.isScanning = false;
            window.location.href = `nova_insp.html?id=${encodeURIComponent(decodedText.trim())}`;
        });
    }

    showError(message) {
        this.areaScanner.innerHTML = `<p style="color: red; padding: 20px;">${message}</p>`;
        this.carregarCamera.style.display = 'none';
    }

    setupEventListeners() {
        if (this.manualBtn) {
            this.manualBtn.addEventListener('click', () => {
                const manualId = prompt('Digite o código do ponto SPDA manualmente:');
                if (manualId && manualId.trim()) {
                    window.location.href = `nova_insp.html?id=${encodeURIComponent(manualId.trim())}`;
                }
            });
        }
    }

    stopScanner() {
        if (this.html5QrCode && this.isScanning) {
            this.html5QrCode.stop().catch(err => console.log(err));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const scanner = new QRCodeScanner();
    scanner.init();
});