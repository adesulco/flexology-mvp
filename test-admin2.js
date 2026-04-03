const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const allUsers = await prisma.user.findMany({ where: { role: { not: 'CLIENT' } } });
  console.log(allUsers.map(u => ({ id: u.id, role: u.role, phone: u.phoneNumber })));
  process.exit();
}
run();
