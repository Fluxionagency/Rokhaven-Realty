/**
 * GET /api/expertlisting/debug?url=...
 * Admin-only diagnostic: fetches a URL from server-side and returns
 * HTML length, RSC payload length, all /properties/ paths found,
 * and sitemap status. Used to diagnose what ExpertListing.ng exposes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const HEADERS: HeadersInit = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const targetUrl = req.nextUrl.searchParams.get('url') || 'https://www.expertlisting.ng/sitemap.xml'

  try {
    const res = await fetch(targetUrl, { headers: HEADERS })
    const body = await res.text()

    // Extract RSC payload
    const rscChunks: string[] = []
    const rscRe = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g
    let m: RegExpExecArray | null
    while ((m = rscRe.exec(body)) !== null) {
      try { rscChunks.push(JSON.parse(`"${m[1]}"`)) } catch { /* skip */ }
    }
    const rsc = rscChunks.join('')

    // Find all /properties/ paths
    const propPaths = new Set<string>()
    const propRe = /\/properties\/[^\s"'<>]{5,}/g
    while ((m = propRe.exec(body + rsc)) !== null) {
      propPaths.add(m[0].split('"')[0].split("'")[0].split('<')[0])
    }

    // Find all <loc> entries (sitemap)
    const locUrls: string[] = []
    const locRe = /<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/g
    while ((m = locRe.exec(body)) !== null) locUrls.push(m[1])

    // Find fetch/API calls in scripts
    const apiCalls = new Set<string>()
    const apiRe = /(\/api\/[^\s"'<>]{3,})/g
    while ((m = apiRe.exec(body)) !== null) apiCalls.add(m[1].split('"')[0])

    return NextResponse.json({
      url: targetUrl,
      httpStatus: res.status,
      htmlLength: body.length,
      rscLength: rsc.length,
      propertyPaths: [...propPaths].slice(0, 20),
      propertyPathCount: propPaths.size,
      sitemapLocs: locUrls.slice(0, 20),
      sitemapLocCount: locUrls.length,
      apiCallsFound: [...apiCalls].slice(0, 20),
      bodySnippet: body.substring(0, 800),
      rscSnippet: rsc.substring(0, 800),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, url: targetUrl }, { status: 500 })
  }
}
