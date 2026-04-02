import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { addMinutes } from 'date-fns'
import { getTenant } from '@/lib/tenant'

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { mode, locationId, serviceId, flexologistId, scheduledDate, homeAddress, homeMapLink, pointsUsed, guestName, guestPhone, isHappyHourActive } = body;

    // Reject if neither logged in nor provided guest details
    if (!session?.userId && (!guestName || !guestPhone)) {
       return NextResponse.json({ error: 'Unauthorized. Please log in or provide guest contact details.' }, { status: 401 });
    }

    if (!mode || !serviceId || !scheduledDate) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    // Server-side validation check
    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) return NextResponse.json({ error: 'Invalid service' }, { status: 400 })

    // Temporary Hold Engine: Real-time overlap collision check
    if (flexologistId && flexologistId !== 'any') {
       const requestedStart = new Date(scheduledDate);
       const requestedEnd = addMinutes(requestedStart, service.duration);
       
       const overlappingBooking = await prisma.booking.findFirst({
          where: {
             flexologistId,
             status: { in: ['CONFIRMED', 'PENDING'] },
             OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
             ],
             AND: [
                { scheduledDate: { lt: requestedEnd } }
             ]
          },
          include: { service: true }
       });
       
       if (overlappingBooking) {
          // Extra strict overlap check including duration of the existing booking
          const existingStart = new Date(overlappingBooking.scheduledDate);
          const existingEnd = addMinutes(existingStart, overlappingBooking.service?.duration || 60);
          
          if (requestedStart < existingEnd && requestedEnd > existingStart) {
             return NextResponse.json({ error: 'Slot became unavailable. Please choose another time.' }, { status: 409 });
          }
       }
    }

    // ID Resolution (Logged In User vs Guest User)
    let user;
    if (session?.userId) {
       user = await prisma.user.findUnique({ where: { id: session.userId as string } });
    } else {
       // Deep link / Guest Checkout logic: find by phone or create shadow account
       const sanitizedPhone = guestPhone.trim();
       user = await prisma.user.findUnique({ where: { phoneNumber: sanitizedPhone } });
       
       if (!user) {
          user = await prisma.user.create({
             data: {
                name: guestName.trim(),
                phoneNumber: sanitizedPhone,
                role: 'CLIENT',
                points: 0,
                tier: 'FLEX'
             }
          });
       }
    }
    
    if (!user) return NextResponse.json({ error: 'User could not be resolved' }, { status: 404 })

    // Financial calculations
    let basePrice = service.price;
    let tierDiscountAmount = 0;
    
    // Apply Tier Deductions dynamically
    try {
       const userTier = await prisma.membershipTier.findUnique({ where: { rank: user.tier } });
       if (userTier && userTier.discountPercent > 0) {
          tierDiscountAmount = Math.floor(basePrice * (userTier.discountPercent / 100));
       }
    } catch(e) { console.error(e); }
    
    // Apply AI Gap Optimizer Deduction
    let aiDiscountAmount = 0;
    if (isHappyHourActive) {
       aiDiscountAmount = Math.floor(basePrice * 0.30);
    }
    
    let finalPrice = Math.max(0, basePrice - tierDiscountAmount - aiDiscountAmount);
    let actualPointsBurned = 0;

    if (pointsUsed && typeof pointsUsed === 'number' && pointsUsed > 0 && user.points > 0) {
       // Cap the points burned securely at the total service price OR the user's max points, preventing negative balances
       actualPointsBurned = Math.min(pointsUsed, user.points, finalPrice);
       finalPrice -= actualPointsBurned;

       // Deduct the points safely
       await prisma.user.update({
          where: { id: user.id },
          data: { points: { decrement: actualPointsBurned } }
       })
    }

    const tenant = await getTenant()

    const booking = await prisma.booking.create({
      data: {
        mode,
        tenantId: tenant?.id,
        userId: user.id,
        serviceId,
        flexologistId: flexologistId === 'any' ? null : flexologistId,
        locationId: mode === 'OUTLET' ? locationId : null,
        homeAddress: mode === 'HOME' ? homeAddress : null,
        homeMapLink: mode === 'HOME' ? homeMapLink : null,
        scheduledDate: new Date(scheduledDate),
        totalPrice: finalPrice, 
        status: 'PENDING',
        expiresAt: addMinutes(new Date(), 10) // Phase 3: Temporary Hold locks the slot for exactly 10 minutes
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking Error:', error)
    return NextResponse.json({ error: 'Internal server error processing booking' }, { status: 500 })
  }
}
