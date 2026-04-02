import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenant } from '@/lib/tenant'

export async function GET() {
  try {
    const tenant = await getTenant()
    const services = await prisma.service.findMany({
      where: { isActive: true, tenantId: tenant?.id },
      orderBy: { price: 'asc' }
    })
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('Failed to fetch services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}
