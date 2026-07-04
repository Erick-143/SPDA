// seedMock.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando injeção de Mock Data para a banca...");

  let inspetor = await prisma.usuarios.findFirst({ where: { perfil: 'Inspetor de Campo' } });
  if (!inspetor) {
    inspetor = await prisma.usuarios.create({ data: { nome: 'Carlos Silva', perfil: 'Inspetor de Campo' } });
  }

  // 1.5. Criar o usuário Gestor Padrão para a equipe testar sem problemas
  let gestor = await prisma.usuarios.findUnique({ where: { email: 'gestorexemplo12@gmail.com' } });
  if (!gestor) {
    gestor = await prisma.usuarios.create({ 
      data: { 
        nome: 'Gestor Teste', 
        email: 'gestorexemplo12@gmail.com', 
        perfil: 'gestor' 
      } 
    });
  }

  // 2. Pega as configurações base (O Cliente, a Área e o Tipo que criamos no primeiro teste)
  const cliente = await prisma.cliente.findFirst();
  const area = await prisma.area.findFirst();
  const tipo = await prisma.tipo_ponto.findFirst();

  if (!cliente || !area || !tipo) {
    console.error("Erro: Banco vazio! Rode o arquivo seed.js anterior primeiro.");
    return;
  }

  console.log("Criando 14 pontos de SPDA com laudos preenchidos...");
  
  // 3. O Loop da Mágica (Faz o trabalho de criar 14 pontos)
  for (let i = 1; i <= 14; i++) {
    const baseCodigo = `${cliente.sigla}-SPDA-${area.sigla}-${tipo.sigla}`;
    
    // Cria o ponto
    const novoPonto = await prisma.pontos_spda.create({
      data: {
        codigo_unico: `${baseCodigo}-TEMP-MOCK-${i}`,
        cliente_id: cliente.id,
        area_id: area.id,
        tipo_ponto_id: tipo.id,
        localizacao: `Setor Industrial - Quadrante ${i}`,
        descricao: `Malha de aterramento ${i}`,
        criticidade: i % 2 === 0 ? 'ALTA' : 'MEDIA'
      }
    });

    // Atualiza a Regra de Negócio da Tag (Ex: MET-SPDA-GLP-HST-002)
    const codigoDefinitivo = `${baseCodigo}-${String(novoPonto.id).padStart(3, '0')}`;
    await prisma.pontos_spda.update({
      where: { id: novoPonto.id },
      data: { codigo_unico: codigoDefinitivo }
    });

    // 4. Cria a Inspeção para este Ponto (Laudo do Técnico)
    // A cada 3 pontos, simulamos que um está ruim (para os gráficos do Dashboard)
    const estaRuim = (i % 3 === 0);

    await prisma.inspecoes.create({
      data: {
        ponto_id: novoPonto.id,
        usuario_id: inspetor.id,
        condicao_visual: estaRuim ? 'Oxidação aparente' : 'Boa',
        continuidade_eletrica: (0.1 + Math.random()).toFixed(2), // Valores elétricos aleatórios
        resistencia_aterramento: (5 + Math.random() * 5).toFixed(2),
        oxidacao: estaRuim,
        necessidade_correcao: estaRuim,
        conformidade: !estaRuim, // Se está ruim, Não Conforme
        observacoes: estaRuim ? 'Necessária a substituição da haste e lixamento' : 'Parâmetros normais'
      }
    });
  }

  console.log("✅ Sucesso! O seu banco está recheado com 14 pontos e 14 inspeções prontas para a Banca.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
