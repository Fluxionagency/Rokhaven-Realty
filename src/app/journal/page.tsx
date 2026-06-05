'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const MARK_PATH = 'M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z';

const CAT_LABELS: Record<string, string> = {
  market: 'MARKET INSIGHTS',
  living: 'LUXURY LIVING',
  neighbourhood: 'NEIGHBOURHOODS',
  investment: 'INVESTMENT',
  news: 'NEWS',
};

const GRAD_CLASSES = [
  styles.grad1, styles.grad2, styles.grad3,
  styles.grad4, styles.grad5, styles.grad6,
];

const STATIC_ARTICLES = [
  {
    _id: '1',
    slug: 'waterfront-living-lagos',
    category: 'market',
    title: 'The Rise of Waterfront Living in Lagos: Why Ikoyi & Victoria Island Command Premium Prices',
    excerpt: "Nigeria's coastal luxury market has undergone a profound transformation over the past decade. We examine the forces reshaping premium waterfront real estate in Lagos — and what it means for buyers and investors alike.",
    publishedAt: '2026-05-28T00:00:00Z',
    readTime: '8 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorBio: '12 years advising ultra-high-net-worth clients on luxury acquisitions across Lagos and Abuja.',
    featured: true,
    tags: ['Lagos', 'Ikoyi', 'Victoria Island', 'Waterfront', 'Investment'],
    coverImageUrl: null,
    body: null,
  },
  {
    _id: '2',
    slug: 'investment-outlook-2026',
    category: 'investment',
    title: '2026 Outlook: Where Smart Money Is Moving in Nigerian Real Estate',
    excerpt: "A detailed analysis of emerging investment corridors, yield expectations, and the macro trends shaping portfolio decisions for Nigeria's high-net-worth investors.",
    publishedAt: '2026-05-22T00:00:00Z',
    readTime: '6 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorBio: '12 years advising ultra-high-net-worth clients on luxury acquisitions across Lagos and Abuja.',
    featured: false,
    tags: ['Investment', 'Nigeria', 'Portfolio'],
    coverImageUrl: null,
    body: null,
  },
  {
    _id: '3',
    slug: 'banana-island-guide',
    category: 'neighbourhood',
    title: "Banana Island: Understanding Africa's Most Coveted Address",
    excerpt: "A guided tour of Nigeria's most exclusive residential enclave — its history, architecture, residents, and why a property here remains the ultimate status acquisition.",
    publishedAt: '2026-05-15T00:00:00Z',
    readTime: '7 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorBio: '12 years advising ultra-high-net-worth clients on luxury acquisitions across Lagos and Abuja.',
    featured: false,
    tags: ['Banana Island', 'Neighbourhoods', 'Lagos'],
    coverImageUrl: null,
    body: null,
  },
  {
    _id: '4',
    slug: 'shortlet-economy',
    category: 'living',
    title: 'The New Shortlet Economy: How Furnished Residences Are Reshaping Nigerian Hospitality',
    excerpt: 'Premium furnished apartments are redefining short-stay culture in Lagos and Abuja. We explore the rise of the luxury shortlet and its implications for buyers and investors.',
    publishedAt: '2026-05-10T00:00:00Z',
    readTime: '5 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorBio: '12 years advising ultra-high-net-worth clients on luxury acquisitions across Lagos and Abuja.',
    featured: false,
    tags: ['Shortlet', 'Lagos', 'Abuja'],
    coverImageUrl: null,
    body: null,
  },
  {
    _id: '5',
    slug: 'maitama-abuja',
    category: 'neighbourhood',
    title: 'Maitama, Abuja: Where Prestige, Privacy and Premium Returns Converge',
    excerpt: "The Federal Capital Territory's premier residential district has quietly become one of Nigeria's strongest property markets. A deep dive into what makes Maitama compelling.",
    publishedAt: '2026-05-03T00:00:00Z',
    readTime: '6 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorBio: '12 years advising ultra-high-net-worth clients on luxury acquisitions across Lagos and Abuja.',
    featured: false,
    tags: ['Maitama', 'Abuja', 'Investment'],
    coverImageUrl: null,
    body: null,
  },
  {
    _id: '6',
    slug: 'naira-valuations',
    category: 'market',
    title: 'Understanding Naira-Denominated Property Valuations in a Post-Float Era',
    excerpt: "The naira's liberalisation has created both complexity and opportunity in Nigeria's luxury property market. Here is what buyers, sellers, and investors need to understand.",
    publishedAt: '2026-04-26T00:00:00Z',
    readTime: '9 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorBio: '12 years advising ultra-high-net-worth clients on luxury acquisitions across Lagos and Abuja.',
    featured: false,
    tags: ['Naira', 'Valuations', 'Market Insights'],
    coverImageUrl: null,
    body: null,
  },
  {
    _id: '7',
    slug: 'private-estates',
    category: 'living',
    title: "Inside Nigeria's Most Exclusive Private Estates: Architecture, Community and Legacy",
    excerpt: 'A curated look at the gated communities that define ultra-premium residential living in Nigeria — the amenities, the architecture, and the communities they have cultivated.',
    publishedAt: '2026-04-18T00:00:00Z',
    readTime: '7 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorBio: '12 years advising ultra-high-net-worth clients on luxury acquisitions across Lagos and Abuja.',
    featured: false,
    tags: ['Private Estates', 'Lagos', 'Architecture'],
    coverImageUrl: null,
    body: null,
  },
];

type Article = typeof STATIC_ARTICLES[0];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function authorInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

export default function JournalPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [progress, setProgress] = useState(0);
  const [articles, setArticles] = useState<Article[]>(STATIC_ARTICLES);

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    if (!projectId) return;
    import('@/sanity/client').then(({ client }) =>
      import('@/sanity/queries').then(({ allPostsQuery }) =>
        client.fetch(allPostsQuery).then((data: Article[]) => {
          if (data && data.length > 0) setArticles(data);
        }).catch(() => {})
      )
    );
  }, []);

  useEffect(() => {
    if (!openArticle) return;
    const handleScroll = () => {
      const doc = document.documentElement;
      const pct = doc.scrollHeight - doc.clientHeight > 0
        ? (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100
        : 0;
      setProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [openArticle]);

  function openArt(article: Article) {
    setOpenArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToIndex() {
    setOpenArticle(null);
    setProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const featured = articles.find(a => a.featured) ?? articles[0];
  const gridArticles = articles.filter(a => !a.featured);

  const showFeatured = activeFilter === 'all' || activeFilter === featured?.category;
  const visibleGrid = gridArticles.filter(
    a => activeFilter === 'all' || a.category === activeFilter
  );

  function gradFor(article: Article) {
    const idx = articles.findIndex(a => a._id === article._id);
    return GRAD_CLASSES[idx % GRAD_CLASSES.length];
  }

  if (openArticle) {
    const relPosts = articles.filter(a => a._id !== openArticle._id).slice(0, 3);
    return (
      <>
        <Nav />
        <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <header className={styles.artHdr}>
            <div className={styles.artBc}>
              <button onClick={backToIndex}>← Back to Journal</button>
            </div>
            <div className={styles.artCat}>{CAT_LABELS[openArticle.category] ?? openArticle.category.toUpperCase()}</div>
            <h1>{openArticle.title}</h1>
            <p className={styles.artDeck}>{openArticle.excerpt}</p>
            <div className={styles.artByline}>
              <div className={styles.artAv}>{authorInitial(openArticle.author)}</div>
              <div>
                <div className={styles.artAuthor}>{openArticle.author} &nbsp;·&nbsp; {openArticle.authorRole}</div>
                <div className={styles.artDate}>{formatDate(openArticle.publishedAt)} &nbsp;·&nbsp; {openArticle.readTime} read</div>
              </div>
            </div>
          </header>

          {openArticle.coverImageUrl ? (
            <div className={styles.artHero} style={{ backgroundImage: `url(${openArticle.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          ) : (
            <div className={`${styles.artHero} ${gradFor(openArticle)}`}>
              <svg width="400" height="400" viewBox="0 0 60 60" fill="#C0A870">
                <path d={MARK_PATH} />
              </svg>
            </div>
          )}

          <div className={styles.artLayout}>
            <div className={styles.artBody}>
              {openArticle.body ? (
                <SanityBody body={openArticle.body} />
              ) : (
                <>
                  <p className={styles.lead}>
                    Lagos&apos;s relationship with its waterfront is, at its heart, a story about aspiration. For generations, proximity to the Atlantic — to the lagoons, the creeks, the shimmering expanse of Victoria Island&apos;s southern edge — has signalled arrival.
                  </p>
                  <p>Over the past decade, that relationship has deepened into something more structural. Waterfront properties in Lagos&apos;s premium corridors have not merely appreciated; they have redefined what luxury residential living means in sub-Saharan Africa&apos;s largest city.</p>
                  <p>The numbers are instructive. Between 2016 and 2026, prime waterfront properties in Ikoyi have delivered compound annual returns of between 14 and 22 per cent in Naira terms — significantly outpacing broader Lagos real estate indices and, in USD-adjusted terms, offering competitive returns even against global benchmarks.</p>
                  <h2>The Ikoyi Premium: Old Money, New Architecture</h2>
                  <p>Ikoyi has occupied a singular position in Lagos&apos;s social and architectural imagination since the colonial era. Originally the preserve of British administrators, its leafy avenues and generous plot sizes established a standard of residential amenity that the rest of Lagos has spent decades attempting to replicate without quite succeeding.</p>
                  <div className={styles.pullQuote}>
                    <p>&ldquo;Waterfront properties in Ikoyi have consistently outperformed the broader Lagos market by 18–28% over the past decade. The premium is structural, not cyclical.&rdquo;</p>
                    <cite>— RokHaven Market Intelligence Report, Q1 2026</cite>
                  </div>
                  <p>The supply constraint is real and deliberate. New waterfront plots in Ikoyi are extraordinarily scarce. What comes to market typically does so through off-market introductions — which is precisely why relationships with established brokers are not a luxury but a necessity for serious buyers.</p>
                </>
              )}
              {openArticle.tags && openArticle.tags.length > 0 && (
                <div className={styles.artTags}>
                  {openArticle.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <aside className={styles.artSidebar}>
              <div className={styles.sidebarCard}>
                <div className={styles.sidebarLbl}>About the Author</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className={styles.artAv} style={{ flexShrink: 0 }}>{authorInitial(openArticle.author)}</div>
                  <div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: 'var(--ivory)', marginBottom: 4 }}>{openArticle.author}</div>
                    <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.12em', marginBottom: 10 }}>{openArticle.authorRole.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: 'rgba(244,237,224,.42)', lineHeight: 1.75, fontWeight: 300 }}>{openArticle.authorBio}</div>
                  </div>
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <div className={styles.sidebarLbl}>Related Articles</div>
                {relPosts.map(rel => (
                  <div key={rel._id} className={styles.relPost} onClick={() => openArt(rel)}>
                    <div className={`${styles.relImg} ${gradFor(rel)}`} />
                    <div>
                      <h4>{rel.title}</h4>
                      <div className={styles.relMeta}>{CAT_LABELS[rel.category] ?? rel.category.toUpperCase()} · {rel.readTime}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.sidebarCard}>
                <div className={styles.sidebarLbl}>Journal Updates</div>
                <p style={{ fontSize: 12, color: 'rgba(244,237,224,.38)', lineHeight: 1.75, marginBottom: 16, fontWeight: 300 }}>Receive our latest market insights and editorial features directly.</p>
                <div className={styles.nlForm}>
                  <input type="email" placeholder="Your email address" />
                  <button type="button">Subscribe</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
        <header className={styles.pageHdr}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: 'rgba(244,237,224,.55)' }}>Journal</span>
          </div>
          <div className={styles.eyebrow}>Perspectives</div>
          <h1>Insights from the<br /><em>World of Luxury Real Estate</em></h1>
          <p className={styles.sub}>Market analysis, neighbourhood guides, investment perspectives, and the art of curated living.</p>
        </header>

        <div className={styles.filterStrip}>
          {[
            { key: 'all', label: 'All' },
            { key: 'market', label: 'Market Insights' },
            { key: 'living', label: 'Luxury Living' },
            { key: 'neighbourhood', label: 'Neighbourhoods' },
            { key: 'investment', label: 'Investment' },
            { key: 'news', label: 'News' },
          ].map(f => (
            <button
              key={f.key}
              className={`${styles.chip}${activeFilter === f.key ? ' ' + styles.active : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {showFeatured && featured && (
          <section className={styles.featuredWrap}>
            <div className={styles.featuredLbl}>Featured</div>
            <article className={styles.featuredCard} onClick={() => openArt(featured)}>
              {featured.coverImageUrl ? (
                <div className={styles.featImg} style={{ backgroundImage: `url(${featured.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className={styles.catBadge}>{CAT_LABELS[featured.category]}</div>
                </div>
              ) : (
                <div className={`${styles.featImg} ${gradFor(featured)}`}>
                  <div className={styles.catBadge}>{CAT_LABELS[featured.category]}</div>
                  <svg width="280" height="280" viewBox="0 0 60 60" fill="#C0A870" style={{ opacity: .06, position: 'relative' }}>
                    <path d={MARK_PATH} />
                  </svg>
                </div>
              )}
              <div className={styles.featBody}>
                <div>
                  <div className={styles.featMeta}>
                    <span>{formatDate(featured.publishedAt)}</span>
                    <span>·</span>
                    <span>{featured.readTime} read</span>
                  </div>
                  <h2>{featured.title}</h2>
                  <p className={styles.featExcerpt}>{featured.excerpt}</p>
                </div>
                <div className={styles.featFooter}>
                  <div className={styles.authorRow}>
                    <div className={styles.authorAv}>{authorInitial(featured.author)}</div>
                    <div>
                      <div className={styles.authorName}>{featured.author}</div>
                      <div className={styles.authorRole}>{featured.authorRole}</div>
                    </div>
                  </div>
                  <button className={styles.readBtn}>Read Article</button>
                </div>
              </div>
            </article>
          </section>
        )}

        <section className={styles.gridSection}>
          <div className={styles.gridLbl}>Latest Articles</div>
          <div className={styles.articleGrid}>
            {visibleGrid.map(article => (
              <article
                key={article._id}
                className={styles.acard}
                onClick={() => openArt(article)}
              >
                {article.coverImageUrl ? (
                  <div className={styles.acardImg} style={{ backgroundImage: `url(${article.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className={styles.catBadge}>{CAT_LABELS[article.category]}</div>
                  </div>
                ) : (
                  <div className={`${styles.acardImg} ${gradFor(article)}`}>
                    <div className={styles.gradWm}>
                      <svg width="100" height="100" viewBox="0 0 60 60" fill="#C0A870">
                        <path d={MARK_PATH} />
                      </svg>
                    </div>
                    <div className={styles.catBadge}>{CAT_LABELS[article.category]}</div>
                  </div>
                )}
                <div className={styles.acardBody}>
                  <h3>{article.title}</h3>
                  <p className={styles.acardExcerpt}>{article.excerpt}</p>
                  <div className={styles.acardFooter}>
                    <span className={styles.acardMeta}>{formatDate(article.publishedAt)} · {article.readTime}</span>
                    <span className={styles.acardRead}>Read →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

function SanityBody({ body }: { body: unknown[] }) {
  return (
    <div>
      {body.map((block: unknown, i: number) => {
        const b = block as { _type: string; _key: string; style?: string; children?: { text: string; marks?: string[] }[]; asset?: { url: string }; alt?: string };
        if (b._type === 'block') {
          const text = b.children?.map(c => c.text).join('') ?? '';
          if (b.style === 'h2') return <h2 key={b._key ?? i}>{text}</h2>;
          if (b.style === 'h3') return <h3 key={b._key ?? i}>{text}</h3>;
          if (b.style === 'blockquote') return (
            <div key={b._key ?? i} className={styles.pullQuote}><p>&ldquo;{text}&rdquo;</p></div>
          );
          if (!text.trim()) return null;
          return <p key={b._key ?? i}>{b.children?.map((c, ci) => {
            const isBold = c.marks?.includes('strong');
            const isItalic = c.marks?.includes('em');
            if (isBold) return <strong key={ci}>{c.text}</strong>;
            if (isItalic) return <em key={ci}>{c.text}</em>;
            return c.text;
          })}</p>;
        }
        if (b._type === 'image' && b.asset?.url) {
          return <img key={b._key ?? i} src={b.asset.url} alt={b.alt ?? ''} style={{ width: '100%', borderRadius: 2, margin: '24px 0' }} />;
        }
        return null;
      })}
    </div>
  );
}
