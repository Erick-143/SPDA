function criarContainerQR(codigoPonto) {
    // Remove se já existir
    const existente = document.getElementById('qr-code-container');
    if (existente) existente.remove();
    
    const container = document.createElement('div');
    container.id = 'qr-code-container';
    container.className = 'spda-qr-wrapper';
    
    container.innerHTML = `
        <div class="spda-qr-content">
            <div class="spda-qr-info">
                <h4>📱 QR Code do Ponto</h4>
                <p><strong>Código:</strong> ${codigoPonto}</p>
            </div>
            <div class="spda-qr-code" id="qrcode"></div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                <button onclick="baixarQRCode()" class="spda-btn-qr spda-btn-qr-primary">
                    📥 Baixar
                </button>
                <button onclick="imprimirQRCode()" class="spda-btn-qr spda-btn-qr-secondary">
                    🖨️ Imprimir
                </button>
            </div>
        </div>
    `;
    
    return container;
}

/**
 * Gera a imagem do QR Code
 */
function gerarQRCode(codigoPonto) {
    const containerQR = document.getElementById('qrcode');
    if (!containerQR) {
        console.error('Container QR não encontrado');
        return;
    }
    
    containerQR.innerHTML = '';
    
    // URL para o QR Code - usa a página atual
    const urlAtual = window.location.href;
    const urlBase = urlAtual.includes('cadastro') ? 
        window.location.origin + '/consulta.html' : 
        window.location.origin + window.location.pathname;
    
    const urlCompleta = `${urlBase}?ponto=${codigoPonto}`;
    
    console.log('Gerando QR Code para:', urlCompleta);
    
    try {
        if (typeof QRCode !== 'undefined') {
            new QRCode(containerQR, {
                text: urlCompleta,
                width: 120,
                height: 120,
                colorDark: "#01257D",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // Fallback: API externa
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(urlCompleta)}`;
            img.alt = 'QR Code';
            img.style.maxWidth = '120px';
            containerQR.appendChild(img);
        }
    } catch (error) {
        console.error('Erro ao gerar QR:', error);
        containerQR.innerHTML = '<span style="color: #e74c3c; font-size: 0.8rem;">Erro ao gerar QR</span>';
    }
}

/**
 * Remove o QR Code
 */
function removerQRCode() {
    const container = document.getElementById('qr-code-container');
    if (container) {
        container.remove();
        console.log('QR Code removido');
    }
}

/**
 * Baixa o QR Code
 */
function baixarQRCode() {
    const canvas = document.querySelector('#qr-code-container canvas');
    if (!canvas) {
        alert('Nenhum QR Code disponível para baixar.');
        return;
    }
    
    const codigoElement = document.querySelector('.spda-qr-info p');
    const codigo = codigoElement ? codigoElement.textContent.replace('Código:', '').trim() : 'QRCode';
    
    const link = document.createElement('a');
    link.download = `QRCode_${codigo}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * Imprime o QR Code
 */
function imprimirQRCode() {
    const container = document.getElementById('qr-code-container');
    if (!container) {
        alert('Nenhum QR Code disponível para imprimir.');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>QR Code - SPDA</title>
                <style>
                    body { 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        flex-direction: column; 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                    }
                    .spda-qr-wrapper { 
                        text-align: center; 
                        padding: 30px; 
                        border: 2px solid #01257D; 
                        border-radius: 12px; 
                    }
                    .spda-btn-qr { display: none; }
                </style>
            </head>
            <body>
                ${container.outerHTML}
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                    Gerado em: ${new Date().toLocaleString()}
                </p>
                <script>
                    window.onload = function() { 
                        window.print(); 
                        window.close(); 
                    }
                <\/script>
            </body>
        </html>
    `);
    printWindow.document.close();
}