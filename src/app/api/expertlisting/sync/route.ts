/**
 * POST /api/expertlisting/sync
 *
 * Called by Vercel Cron daily (vercel.json) and manually from admin UI.
 * Paginates through ExpertListing.ng rent + sale pages and imports
 * properties that are "sourced and verified directly by Expert Listing".
 *
 * Optional env var:
 *   CRON_SECRET  — random secret to protect this endpoint from external callers
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllListingUrls, scrapeProperty } from '@/lib/expertlisting/scraper'

export async function POST(req: NextRequest) {
  // ── Auth: allow admin session OR cron secret ─────────────
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

  // ── Create sync log ──────────────────────────────────────
  const log = await prisma.importSyncLog.create({
    data: { status: 'RUNNING' },
  })

  let newCount = 0, skippedCount = 0, errorCount = 0

  try {
    // 1. Collect all listing URLs from rent + sale pages
    const listingUrls = await getAllListingUrls(15)

    if (listingUrls.length === 0) {
      await prisma.importSyncLog.update({
        where: { id: log.id },
        data: { status: 'COMPLETED', finishedAt: new Date(), newCount: 0 },
      })
      return NextResponse.json({
        success: true,
        message: 'No listing URLs found — ExpertListing.ng may load listings client-side',
        newCount: 0, skippedCount: 0, errorCount: 0,
      })
    }

    // 2. Skip already-imported listings
    const listingIds = listingUrls
      .map((url) => Number(url.match(/\/(\d+)(?:[/?#].*)?$/)?.[1]))
      .filter((id) => !isNaN(id) && id > 0)

    const existing = await prisma.importedProperty.findMany({
      where: { expertlistingId: { in: listingIds } },
      select: { expertlistingId: true },
    })
    const existingIds = new Set(existing.map((r) => r.expertlistingId))

    const newUrls = listingUrls.filter((url) => {
      const id = Number(url.match(/\/(\d+)(?:[/?#].*)?$/)?.[1])
      return id && !existingIds.has(id)
    })

    console.log(`[sync] ${listingUrls.length} found | ${existingIds.size} existing | ${newUrls.length} new`)

    // 3. Scrape and save each new listing (EL-verified only)
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
            description: property.description,
            images:      JSON.stringify(property.images),
            coverImage:  property.coverImage,
            features:    JSON.stringify(property.features),
            updatedAt:   new Date(),
          },
        })

        console.log(`[sync] Imported: ${property.title} (${property.refId})`)
        newCount++

        await new Promise((r) => setTimeout(r, 700))
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
      message: `${newCount} imported, ${skippedCount} skipped (not EL-verified), ${errorCount} errors`,
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
