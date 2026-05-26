/**
 * POST /api/expertlisting/sync
 *
 * Called by Vercel Cron every 30 min (vercel.json) and manually from admin UI.
 * Polls the agent's expertlisting.ng profile → imports new verified listings.
 *
 * Required env vars:
 *   EXPERTLISTING_PROFILE_URL  — your agent profile page on expertlisting.ng
 *   CRON_SECRET                — random secret to protect this endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAgentListingUrls, scrapeProperty } from '@/lib/expertlisting/scraper'

export async function POST(req: NextRequest) {
  // ── Auth: accept cron secret OR admin session ────────────
  const cronSecret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  const isCron = cronSecret && auth === `Bearer ${cronSecret}`

  if (!isCron) {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const profileUrl = process.env.EXPERTLISTING_PROFILE_URL
  if (!profileUrl) {
    return NextResponse.json(
      { error: 'EXPERTLISTING_PROFILE_URL not set in environment' },
      { status: 500 }
    )
  }

  // ── Create sync log ─────────────────────────────────────
  const log = await prisma.importSyncLog.create({
    data: { status: 'RUNNING' },
  })

  let newCount = 0, skippedCount = 0, errorCount = 0

  try {
    // 1. Get all listing URLs from profile
    const listingUrls = await getAgentListingUrls(profileUrl)

    if (listingUrls.length === 0) {
      await prisma.importSyncLog.update({
        where: { id: log.id },
        data: { status: 'COMPLETED', finishedAt: new Date(), newCount: 0 },
      })
      return NextResponse.json({ message: 'No listings found on profile', newCount: 0 })
    }

    // 2. Find which IDs are already imported
    const listingIds = listingUrls
      .map((url) => Number(url.match(/\/(\d+)$/)?.[1]))
      .filter((id) => !isNaN(id) && id > 0)

    const existing = await prisma.importedProperty.findMany({
      where: { expertlistingId: { in: listingIds } },
      select: { expertlistingId: true },
    })
    const existingIds = new Set(existing.map((r) => r.expertlistingId))

    const newUrls = listingUrls.filter((url) => {
      const id = Number(url.match(/\/(\d+)$/)?.[1])
      return id && !existingIds.has(id)
    })

    console.log(`[sync] ${listingUrls.length} total | ${existingIds.size} existing | ${newUrls.length} new`)

    // 3. Scrape and save each new listing
    for (const url of newUrls) {
      try {
        const property = await scrapeProperty(url)

        if (!property) {
          skippedCount++
          continue
        }

        await prisma.importedProperty.upsert({
          where: { expertlistingId: property.id },
          create: {
            expertlistingId:    property.id,
            expertlistingUrl:   property.url,
            expertlistingRefId: property.refId,
            title:              property.title,
            description:        property.description,
            price:              property.price,
            currency:           property.currency,
            transactionType:    property.transactionType,
            propertyType:       property.propertyType,
            bedroomCount:       property.bedroomCount,
            bathroomCount:      property.bathroomCount,
            landSize:           property.landSize,
            neighborhood:       property.neighborhood,
            lcda:               property.lcda,
            state:              property.state,
            fullAddress:        property.fullAddress,
            features:           JSON.stringify(property.features),
            images:             JSON.stringify(property.images),
            coverImage:         property.coverImage,
            isVerified:         property.isVerified,
            status:             'PENDING',
          },
          update: {
            // Re-sync images/description in case they updated
            description: property.description,
            images:      JSON.stringify(property.images),
            coverImage:  property.coverImage,
            features:    JSON.stringify(property.features),
            updatedAt:   new Date(),
          },
        })

        console.log(`[sync] Imported: ${property.title} (${property.refId})`)
        newCount++

        // Be polite — 800ms between requests
        await new Promise((r) => setTimeout(r, 800))
      } catch (err: any) {
        console.error(`[sync] Error on ${url}:`, err?.message)
        errorCount++
      }
    }

    await prisma.importSyncLog.update({
      where: { id: log.id },
      data: { status: 'COMPLETED', finishedAt: new Date(), newCount, skippedCount, errorCount },
    })

    return NextResponse.json({
      success: true,
      message: `${newCount} imported, ${skippedCount} skipped (unverified), ${errorCount} errors`,
      newCount, skippedCount, errorCount,
    })
  } catch (err: any) {
    await prisma.importSyncLog.update({
      where: { id: log.id },
      data: { status: 'FAILED', finishedAt: new Date(), errorMessage: err?.message },
    })
    return NextResponse.json({ error: 'Sync failed', details: err?.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
