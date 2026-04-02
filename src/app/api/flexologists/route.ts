import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenant } from '@/lib/tenant'

export async function GET() {
  try {
    const tenant = await getTenant()
    const flexologists = await prisma.flexologist.findMany({
      where: { isActive: true, tenantId: tenant?.id },
      orderBy: { rating: 'desc' }
    })
    
    // Transform bio back to specialty array for frontend compatibility temporarily
    const transformed = flexologists.map(flex => ({
      ...flex,
      specialty: flex.bio ? flex.bio.split(', ') : []
    }))
    
    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Failed to fetch flexologists:', error)
    return NextResponse.json({ error: 'Failed to fetch flexologists' }, { status: 500 })
  }
}
