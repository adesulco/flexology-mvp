import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const flexologists = await prisma.flexologist.findMany({
      where: { isActive: true },
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
