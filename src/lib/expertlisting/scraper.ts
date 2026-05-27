/**
 * expertlisting.ng Scraper
 *
 * Paginates through /properties/rent and /properties/sale on ExpertListing.ng,
 * collects all property URLs, then scrapes each one.
 *
 * FILTER: Only imports listings that contain the text
 * "sourced and verified directly by Expert Listing"
 */

export interface ExpertListingProperty {
  id: number
  refId: string
  url: string
  title: string
  description: string
  price: string
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

const SOURCE_PATHS = ['/properties/rent', '/properties/sale']

const EL_VERIFIED_TEXT = 'sourced and verified directly by Expert Listing'

const FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
}

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

function extractRscPayload(html: string): string {
  const chunks: string[] = []
  const regex = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    try { chunks.push(JSON.parse(`"${match[1]}"`)) } catch { /* skip */ }
  }
  return chunks.join('')
}

/** Extract all property listing URLs from a single page's HTML + RSC payload */
function extractPropertyUrls(html: string, payload: string): string[] {
  const urls = new Set<string>()
  const pattern = /\/properties\/(?:rent|sale|buy|lease|commercial|shortlet)\/[^"'\s<>]+\/\d+/g
  let m: RegExpExecArray | null
  while ((m = pattern.exec(html)) !== null) urls.add(BASE_URL + m[0].split('"')[0].split("'")[0])
  while ((m = pattern.exec(payload)) !== null) urls.add(BASE_URL + m[0].split('"')[0].split('\\')[0])
  return Array.from(urls)
}

/**
 * Paginate through all rent + sale listing pages and return every property URL found.
 * Stops paginating a category when a page yields no new URLs.
 * maxPages caps total pages per category to avoid timeouts.
 */
export async function getAllListingUrls(maxPages = 15): Promise<string[]> {
  const allUrls = new Set<string>()

  for (const path of SOURCE_PATHS) {
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? `${BASE_URL}${path}` : `${BASE_URL}${path}?page=${page}`
      try {
        const html = await fetchHtml(url)
        const payload = extractRscPayload(html)

        const beforeCount = allUrls.size
        for (const u of extractPropertyUrls(html, payload)) allUrls.add(u)
        const found = allUrls.size - beforeCount

        console.log(`[scraper] ${path} page ${page}: +${found} URLs (total ${allUrls.size})`)

        // Debug: log HTML length and sample of /properties/ paths on first page
        if (page === 1) {
          console.log(`[scraper] ${path} HTML length: ${html.length}, RSC length: ${payload.length}`)
          const sample = Array.from(allUrls).slice(0, 3)
          if (sample.length) console.log(`[scraper] Sample URLs:`, sample)
          else console.log(`[scraper] No property URLs found on first page — listings may load client-side`)
        }

        if (found === 0) break
        await new Promise((r) => setTimeout(r, 600))
      } catch (err: any) {
        console.error(`[scraper] Error fetching ${url}:`, err?.message)
        break
      }
    }
  }

  console.log(`[scraper] Total unique listing URLs: ${allUrls.size}`)
  return Array.from(allUrls)
}

function parseProperty(html: string, payload: string, sourceUrl: string): ExpertListingProperty | null {
  try {
    const propIdx = payload.indexOf('"property":{"id":')
    if (propIdx === -1) return null

    const win = payload.substring(propIdx + 11, propIdx + 18000)

    const getStr = (key: string) =>
      new RegExp(`"${key}":\\s*"([^"]*)"`) .exec(win)?.[1] ?? ''
    const getNum = (key: string) =>
      Number(new RegExp(`"${key}":\\s*(\\d+)`).exec(win)?.[1] ?? 0)

    const id = getNum('id')
    if (!id) return null

    const refId           = getStr('ref_id')
    const propertyType    = getStr('property_type')
    const currency        = getStr('currency') || 'NGN'
    const price           = String(getNum('price'))
    const transactionType = getStr('transaction_type')
    const bedroomCount    = getNum('bedroom_count')
    const bathroomCount   = getNum('bathroom_count')

    const landSize = /"land_size":\s*"?([^",}]+)"?/.exec(win)?.[1] ?? null

    const description = (() => {
      const m = /"description":\s*"((?:[^"\\]|\\.)*)"/.exec(win)
      return m ? JSON.parse(`"${m[1]}"`) : ''
    })()

    const neighborhood = /"neighborhood":\{"id":\d+,"name":"([^"]+)"/.exec(win)?.[1] ?? ''
    const lcda         = /"lcda":\{"id":\d+[^}]*"name":"([^"]+)"/.exec(win)?.[1] ?? ''
    const state        = /"state":\{"id":\d+[^}]*"name":"([^"]+)"/.exec(win)?.[1] ?? 'Lagos'
    const fullAddress  = [neighborhood, lcda, state].filter(Boolean).join(', ')

    const title = [
      bedroomCount ? `${bedroomCount} Bedroom` : '',
      propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : '',
      transactionType === 'rent' ? 'for Rent'
        : transactionType === 'sale' ? 'for Sale'
        : transactionType === 'shortlet' ? 'Shortlet'
        : transactionType === 'lease' ? 'for Lease' : '',
      'in', neighborhood, lcda ? `${lcda},` : '', state,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

    const features: string[] = []
    const amenityRe = /"amenity_name":\s*"([^"]+)"/g
    let am: RegExpExecArray | null
    while ((am = amenityRe.exec(win)) !== null) features.push(am[1])

    const images: string[] = []
    const imgRe = /https:\/\/d3d6p1r1do6n32\.cloudfront\.net\/[^"\\]+/g
    let imgM: RegExpExecArray | null
    while ((imgM = imgRe.exec(win)) !== null) {
      const u = imgM[0].split('\\')[0]
      if (!images.includes(u)) images.push(u)
    }

    return {
      id, refId, url: sourceUrl,
      title, description, price, currency,
      transactionType, propertyType,
      bedroomCount, bathroomCount, landSize,
      neighborhood, lcda, state, fullAddress,
      features, images,
      coverImage: images[0] ?? null,
      isVerified: true,
    }
  } catch (err) {
    console.error('[scraper] Parse error:', err)
    return null
  }
}

/**
 * Scrape a single property page.
 * Returns null if not an ExpertListing-verified property or if unparseable.
 */
export async function scrapeProperty(url: string): Promise<ExpertListingProperty | null> {
  const html = await fetchHtml(url)

  if (!html.includes(EL_VERIFIED_TEXT)) {
    console.log(`[scraper] Skipping — not EL-verified: ${url}`)
    return null
  }

  const payload = extractRscPayload(html)
  const property = parseProperty(html, payload, url)

  if (!property) {
    console.warn(`[scraper] Could not parse: ${url}`)
    return null
  }

  return property
}

export function extractListingIds(html: string): number[] {
  const ids = new Set<number>()
  const re = /\/properties\/(?:rent|sale|buy|lease|commercial|shortlet)\/[^"'\s]+\/(\d+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) ids.add(Number(m[1]))
  return Array.from(ids)
}
