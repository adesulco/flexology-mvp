const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const b = await prisma.booking.findFirst({
    where: { status: 'CONFIRMED', isPaid: false }
  });
  if (b) {
     const u = await prisma.user.findUnique({ where: { id: b.userId }});
     console.log("Found Booking ID: " + b.id);
     console.log("For User ID: " + u.id);
  } else {
     console.log("No pending bookings found.");
  }
  process.exit();
}
run();
