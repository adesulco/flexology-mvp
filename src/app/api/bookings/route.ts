import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const { mode, locationId, serviceId, flexologistId, scheduledDate, homeAddress, homeMapLink } = body

    if (!mode || !serviceId || !scheduledDate) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    // Server-side validation check
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: 'Invalid service' }, { status: 400 })
    }

    // Default User for MVP (until properly authenticated)
    let user = await prisma.user.findFirst()
    if (!user) {
       user = await prisma.user.create({
         data: {
           email: "guest@example.com",
           name: "Guest User"
         }
       })
    }

    const booking = await prisma.booking.create({
      data: {
        mode,
        userId: user.id,
        serviceId,
        flexologistId: flexologistId === 'any' ? null : flexologistId,
        locationId: mode === 'OUTLET' ? locationId : null,
        homeAddress: mode === 'HOME' ? homeAddress : null,
        homeMapLink: mode === 'HOME' ? homeMapLink : null,
        scheduledDate: new Date(scheduledDate),
        totalPrice: service.price, // Calculate perfectly server-side to prevent tampering
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking Error:', error)
    return NextResponse.json({ error: 'Internal server error processing booking' }, { status: 500 })
  }
}
