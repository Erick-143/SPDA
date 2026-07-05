document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('http://localhost:3000/api/dashboard');
        
        if (!res.ok) throw new Error("Erro na rede");
        
        const dados = await res.json();
        
        // Injeta os valores direto nos IDs que você criou no HTML
        document.getElementById('total-pontos').innerText = dados.totalPontos;
        document.getElementById('pontos-conformes').innerText = dados.conformidade.conformes;
        document.getElementById('pontos-nao-conformes').innerText = dados.conformidade.naoConformes;
        document.getElementById('resistencia-media').innerText = dados.mediaResistencia + ' Ω';

    } catch (error) {
        console.error("Erro ao carregar os dados do dashboard:", error);
        
        // Em caso de erro, avisa que falhou de forma visual
        document.getElementById('total-pontos').innerText = "Erro";
        document.getElementById('pontos-conformes').innerText = "-";
        document.getElementById('pontos-nao-conformes').innerText = "-";
        document.getElementById('resistencia-media').innerText = "-";
    }
});
