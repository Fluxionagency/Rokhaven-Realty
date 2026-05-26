/**
 * expertlisting.ng Scraper
 *
 * Fetches property pages, parses the embedded Next.js RSC payload,
 * and returns structured property data.
 *
 * HARD FILTER: Only returns listings where user_is_connected_to_owner = true
 * ("Direct to Owner's Agent" verified badge).
 *
 * No headless browser needed — the data is server-rendered into script tags.
 */

export interface ExpertListingProperty {
  id: number
  refId: string
  url: string
  title: string
  description: string
  price: string          // raw number as string, e.g. "10000000"
  currency: string
  transactionType: string
  propertyType: string
  bedroomCount: number
  bathroomCount: number
  landSize: string | null
  neighborhood: string
  lcda: string
  state: string
  fullAddress: string
  features: string[]
  images: string[]
  coverImage: string | null
  isVerified: boolean
}

const BASE_URL = 'https://www.expertlisting.ng'

const FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
}

/** Fetch HTML with retries */
async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS })
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
      return await res.text()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise((r) => setTimeout(r, 1200 * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

/** Join all __next_f RSC payload chunks from HTML */
function extractRscPayload(html: string): string {
  const chunks: string[] = []
  const regex = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    try {
      chunks.push(JSON.parse(`"${match[1]}"`))
    } catch { /* skip malformed */ }
  }
  return chunks.join('')
}

/** Parse the property object out of the RSC payload */
function parseProperty(payload: string, sourceUrl: string): ExpertListingProperty | null {
  try {
    const propIdx = payload.indexOf('"property":{"id":')
    if (propIdx === -1) return null

    const window = payload.substring(propIdx + 11, propIdx + 18000)

    const getStr = (key: string) =>
      new RegExp(`"${key}":\\s*"([^"]*)"`) .exec(window)?.[1] ?? ''
    const getNum = (key: string) =>
      Number(new RegExp(`"${key}":\\s*(\\d+)`).exec(window)?.[1] ?? 0)
    const getBool = (key: string) =>
      new RegExp(`"${key}":\\s*(true|false)`).exec(window)?.[1] === 'true'

    const id = getNum('id')
    if (!id) return null

    const refId            = getStr('ref_id')
    const propertyType     = getStr('property_type')
    const currency         = getStr('currency') || 'NGN'
    const price            = String(getNum('price'))
    const transactionType  = getStr('transaction_type')
    const isVerified       = getBool('user_is_connected_to_owner')
    const bedroomCount     = getNum('bedroom_count')
    const bathroomCount    = getNum('bathroom_count')

    const landSize = (() => {
      const m = /"land_size":\s*"?([^",}]+)"?/.exec(window)
      return m?.[1] ?? null
    })()

    const description = (() => {
      const m = /"description":\s*"((?:[^"\\]|\\.)*)"/.exec(window)
      return m ? JSON.parse(`"${m[1]}"`) : ''
    })()

    const neighborhood = /"neighborhood":\{"id":\d+,"name":"([^"]+)"/.exec(window)?.[1] ?? ''
    const lcda         = /"lcda":\{"id":\d+[^}]*"name":"([^"]+)"/.exec(window)?.[1] ?? ''
    const state        = /"state":\{"id":\d+[^}]*"name":"([^"]+)"/.exec(window)?.[1] ?? 'Lagos'
    const fullAddress  = [neighborhood, lcda, state].filter(Boolean).join(', ')

    const title = [
      bedroomCount ? `${bedroomCount} Bedroom` : '',
      propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : '',
      transactionType === 'rent' ? 'for Rent'
        : transactionType === 'sale' ? 'for Sale'
        : transactionType === 'lease' ? 'for Lease' : '',
      'in', neighborhood, lcda ? `${lcda},` : '', state,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

    // Amenities / features
    const features: string[] = []
    const amenityRe = /"amenity_name":\s*"([^"]+)"/g
    let am: RegExpExecArray | null
    while ((am = amenityRe.exec(window)) !== null) features.push(am[1])

    // Images from CloudFront
    const images: string[] = []
    const imgRe = /https:\/\/d3d6p1r1do6n32\.cloudfront\.net\/[^"\\]+/g
    let imgM: RegExpExecArray | null
    while ((imgM = imgRe.exec(window)) !== null) {
      const url = imgM[0].split('\\')[0]
      if (!images.includes(url)) images.push(url)
    }

    return {
      id, refId, url: sourceUrl,
      title, description, price, currency,
      transactionType, propertyType,
      bedroomCount, bathroomCount, landSize,
      neighborhood, lcda, state, fullAddress,
      features, images,
      coverImage: images[0] ?? null,
      isVerified,
    }
  } catch (err) {
    console.error('[scraper] Parse error:', err)
    return null
  }
}

/**
 * Scrape a single property URL.
 * Returns null if not parseable OR not "Direct to Owner's Agent".
 */
export async function scrapeProperty(url: string): Promise<ExpertListingProperty | null> {
  const html = await fetchHtml(url)
  const payload = extractRscPayload(html)
  const property = parseProperty(payload, url)

  if (!property) {
    console.warn(`[scraper] Could not parse: ${url}`)
    return null
  }
  if (!property.isVerified) {
    console.log(`[scraper] Skipping unverified listing ${property.refId}`)
    return null
  }
  return property
}

/**
 * Get all property URLs from an agent profile page.
 * Returns full URLs like https://www.expertlisting.ng/properties/rent/lagos/...
 */
export async function getAgentListingUrls(profileUrl: string): Promise<string[]> {
  const html = await fetchHtml(profileUrl)
  const urls = new Set<string>()

  console.log(`[scraper] Profile HTML length: ${html.length}`)

  // From HTML href attributes
  const hrefRe = /href="(\/properties\/(?:rent|sale|buy|lease|commercial|shortlet)\/[^"]+\/\d+)"/g
  let m: RegExpExecArray | null
  while ((m = hrefRe.exec(html)) !== null) urls.add(`${BASE_URL}${m[1]}`)

  // From RSC payload
  const payload = extractRscPayload(html)
  console.log(`[scraper] RSC payload length: ${payload.length}`)
  if (payload.length < 500) {
    console.log(`[scraper] RSC sample: ${payload.substring(0, 500)}`)
  }

  // Log all /properties/ paths found anywhere in HTML to debug URL format
  const anyPropRe = /\/properties\/[^\s"'<>]{5,}/g
  const allPropPaths = new Set<string>()
  while ((m = anyPropRe.exec(html)) !== null) allPropPaths.add(m[0].split('"')[0].split("'")[0])
  if (allPropPaths.size > 0) {
    console.log(`[scraper] All /properties/ paths in HTML:`, [...allPropPaths].slice(0, 10))
  } else {
    console.log(`[scraper] No /properties/ paths found in HTML at all`)
  }

  const payloadRe = /(\/properties\/(?:rent|sale|buy|lease|commercial|shortlet)\/[^"\\]+\/(\d+))/g
  while ((m = payloadRe.exec(payload)) !== null) {
    urls.add(`${BASE_URL}${m[1]}`)
  }

  console.log(`[scraper] Found ${urls.size} listing URLs on profile`)
  return Array.from(urls)
}

/** Extract just the numeric listing IDs from a profile page HTML (fast check) */
export function extractListingIds(html: string): number[] {
  const ids = new Set<number>()
  const re = /\/properties\/(?:rent|sale|buy|lease|commercial|shortlet)\/[^"'\s]+\/(\d+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) ids.add(Number(m[1]))
  return Array.from(ids)
}
