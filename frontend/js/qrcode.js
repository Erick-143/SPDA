function criarContainerQR(codigoPonto) {
    // Remove se já existir
    const existente = document.getElementById('qr-code-container');
    if (existente) existente.remove();
    
    const container = document.createElement('div');
    container.id = 'qr-code-container';
    container.className = 'spda-qr-wrapper';
    
container.innerHTML = `
        <div class="spda-qr-content" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 15px;">
            <div class="spda-qr-info">
                <h4 style="display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--primary-color); margin-bottom: 5px; font-size: 1rem;">
                    <img src="./assets/imagem-qrcode/scan-qr-code.png" alt="ícone qr" width="20" height="20">
                    QR Code do Ponto
                </h4>
                <p style="color: #555; font-size: 0.9rem;"><strong>Código:</strong> ${codigoPonto}</p>
            </div>
            
            <div class="spda-qr-code" id="qrcode" style="background: white; padding: 10px; border-radius: 12px; display: inline-block;"></div>
            
            <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; width: 100%; margin-top: 5px;">
                
                <button type="button" onclick="baixarQRCode()" class="btn-acao-secundaria">
                    <img src="./assets/imagem-qrcode/download.png" alt="baixar" width="16" height="16">
                    Baixar
                </button>
                
                <button type="button" onclick="imprimirQRCode()" class="btn-acao-secundaria">
                    <img src="./assets/imagem-qrcode/printer.png" alt="imprimir" width="16" height="16">
                    Imprimir
                </button>
                
            </div>
        </div>
    `;
    
    return container;
}


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
                width: 300,
                height: 300,
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

function removerQRCode() {
    const container = document.getElementById('qr-code-container');
    if (container) {
        container.remove();
        console.log('QR Code removido');
    }
}

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