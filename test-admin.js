const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
  if (admins.length > 0) {
      console.log(admins[0].phoneNumber, admins[0].email);
  }
  const outletAdmins = await prisma.user.findMany({ where: { role: { in: ['OUTLET_ADMIN', 'OUTLET_MANAGER'] } } });
  if (outletAdmins.length > 0) {
      console.log("Outlet:", outletAdmins[0].phoneNumber, outletAdmins[0].email);
  }
  process.exit();
}
run();
