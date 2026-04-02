import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenant } from '@/lib/tenant'

export async function GET() {
  try {
    const tenant = await getTenant()
    const locations = await prisma.location.findMany({
      where: { isActive: true, tenantId: tenant?.id },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Failed to fetch locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}
