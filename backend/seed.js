const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cliente = await prisma.cliente.create({ data: { nome: 'Indústria Metalúrgica', sigla: 'MET' } });
  const unidade = await prisma.unidade.create({ data: { nome: 'Fábrica Principal', cliente_id: cliente.id } });
  const area = await prisma.area.create({ data: { nome: 'Galpão de Solda', sigla: 'GLP', unidade_id: unidade.id } });
  const tipo = await prisma.tipo_ponto.create({ data: { nome: 'Haste de Aterramento', sigla: 'HST' } });
  
  console.log('✅ Dados base injetados com sucesso para a banca!');
  console.log(`⚠️ ANOTE ESTES NÚMEROS PARA USAR NO POSTMAN:`);
  console.log(`cliente_id: ${cliente.id}`);
  console.log(`area_id: ${area.id}`);
  console.log(`tipo_ponto_id: ${tipo.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
