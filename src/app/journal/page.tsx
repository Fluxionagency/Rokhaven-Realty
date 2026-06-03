'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const MARK_PATH = 'M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z';

const ARTICLES = [
  {
    id: 1,
    slug: 'waterfront-living-lagos',
    cat: 'market',
    catLabel: 'MARKET INSIGHTS',
    title: 'The Rise of Waterfront Living in Lagos: Why Ikoyi & Victoria Island Command Premium Prices',
    excerpt: "Nigeria's coastal luxury market has undergone a profound transformation over the past decade. We examine the forces reshaping premium waterfront real estate in Lagos — and what it means for buyers and investors alike.",
    date: '28 May 2026',
    readTime: '8 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorInitial: 'A',
    gradClass: styles.grad1,
    featured: true,
  },
  {
    id: 2,
    slug: 'investment-outlook-2026',
    cat: 'investment',
    catLabel: 'INVESTMENT',
    title: '2026 Outlook: Where Smart Money Is Moving in Nigerian Real Estate',
    excerpt: 'A detailed analysis of emerging investment corridors, yield expectations, and the macro trends shaping portfolio decisions for Nigeria\'s high-net-worth investors.',
    date: '22 May 2026',
    readTime: '6 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorInitial: 'A',
    gradClass: styles.grad2,
    featured: false,
  },
  {
    id: 3,
    slug: 'banana-island-guide',
    cat: 'neighbourhood',
    catLabel: 'NEIGHBOURHOODS',
    title: "Banana Island: Understanding Africa's Most Coveted Address",
    excerpt: "A guided tour of Nigeria's most exclusive residential enclave — its history, architecture, residents, and why a property here remains the ultimate status acquisition.",
    date: '15 May 2026',
    readTime: '7 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorInitial: 'A',
    gradClass: styles.grad3,
    featured: false,
  },
  {
    id: 4,
    slug: 'shortlet-economy',
    cat: 'living',
    catLabel: 'LUXURY LIVING',
    title: 'The New Shortlet Economy: How Furnished Residences Are Reshaping Nigerian Hospitality',
    excerpt: 'Premium furnished apartments are redefining short-stay culture in Lagos and Abuja. We explore the rise of the luxury shortlet and its implications for buyers and investors.',
    date: '10 May 2026',
    readTime: '5 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorInitial: 'A',
    gradClass: styles.grad4,
    featured: false,
  },
  {
    id: 5,
    slug: 'maitama-abuja',
    cat: 'neighbourhood',
    catLabel: 'NEIGHBOURHOODS',
    title: 'Maitama, Abuja: Where Prestige, Privacy and Premium Returns Converge',
    excerpt: "The Federal Capital Territory's premier residential district has quietly become one of Nigeria's strongest property markets. A deep dive into what makes Maitama compelling.",
    date: '3 May 2026',
    readTime: '6 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorInitial: 'A',
    gradClass: styles.grad5,
    featured: false,
  },
  {
    id: 6,
    slug: 'naira-valuations',
    cat: 'market',
    catLabel: 'MARKET INSIGHTS',
    title: 'Understanding Naira-Denominated Property Valuations in a Post-Float Era',
    excerpt: "The naira's liberalisation has created both complexity and opportunity in Nigeria's luxury property market. Here is what buyers, sellers, and investors need to understand.",
    date: '26 Apr 2026',
    readTime: '9 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorInitial: 'A',
    gradClass: styles.grad6,
    featured: false,
  },
  {
    id: 7,
    slug: 'private-estates',
    cat: 'living',
    catLabel: 'LUXURY LIVING',
    title: "Inside Nigeria's Most Exclusive Private Estates: Architecture, Community and Legacy",
    excerpt: 'A curated look at the gated communities that define ultra-premium residential living in Nigeria — the amenities, the architecture, and the communities they have cultivated.',
    date: '18 Apr 2026',
    readTime: '7 min',
    author: 'Amara Obi',
    authorRole: 'Senior Property Advisor',
    authorInitial: 'A',
    gradClass: styles.grad1,
    featured: false,
  },
];

export default function JournalPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openArticle, setOpenArticle] = useState<typeof ARTICLES[0] | null>(null);
  const [progress, setProgress] = useState(0);

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

  function openArt(article: typeof ARTICLES[0]) {
    setOpenArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToIndex() {
    setOpenArticle(null);
    setProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const featured = ARTICLES.find(a => a.featured)!;
  const gridArticles = ARTICLES.filter(a => !a.featured);

  const showFeatured =
    activeFilter === 'all' || activeFilter === 'market';
  const visibleGrid = gridArticles.filter(
    a => activeFilter === 'all' || a.cat === activeFilter
  );

  if (openArticle) {
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
            <div className={styles.artCat}>{openArticle.catLabel}</div>
            <h1>{openArticle.title}</h1>
            <p className={styles.artDeck}>{openArticle.excerpt}</p>
            <div className={styles.artByline}>
              <div className={styles.artAv}>{openArticle.authorInitial}</div>
              <div>
                <div className={styles.artAuthor}>{openArticle.author} &nbsp;·&nbsp; {openArticle.authorRole}</div>
                <div className={styles.artDate}>{openArticle.date} &nbsp;·&nbsp; {openArticle.readTime} read</div>
              </div>
            </div>
          </header>

          <div className={`${styles.artHero} ${openArticle.gradClass}`}>
            <svg width="400" height="400" viewBox="0 0 60 60" fill="#C0A870">
              <path d={MARK_PATH} />
            </svg>
          </div>

          <div className={styles.artLayout}>
            <div className={styles.artBody}>
              <p className={styles.lead}>
                Lagos&apos;s relationship with its waterfront is, at its heart, a story about aspiration. For generations, proximity to the Atlantic — to the lagoons, the creeks, the shimmering expanse of Victoria Island&apos;s southern edge — has signalled arrival.
              </p>
              <p>Over the past decade, that relationship has deepened into something more structural. Waterfront properties in Lagos&apos;s premium corridors have not merely appreciated; they have redefined what luxury residential living means in sub-Saharan Africa&apos;s largest city.</p>
              <p>The numbers are instructive. Between 2016 and 2026, prime waterfront properties in Ikoyi have delivered compound annual returns of between 14 and 22 per cent in Naira terms — significantly outpacing broader Lagos real estate indices and, in USD-adjusted terms, offering competitive returns even against global benchmarks.</p>
              <h2>The Ikoyi Premium: Old Money, New Architecture</h2>
              <p>Ikoyi has occupied a singular position in Lagos&apos;s social and architectural imagination since the colonial era. Originally the preserve of British administrators, its leafy avenues and generous plot sizes established a standard of residential amenity that the rest of Lagos has spent decades attempting to replicate without quite succeeding.</p>
              <p>What distinguishes contemporary Ikoyi from its historical antecedents is the quality of the built environment. The past eight years have seen a wave of architectural ambition — tower residences with full-floor apartments, low-rise compound developments with bespoke finishes, and standalone villas designed by internationally trained architects who understand both global standards and local conditions.</p>
              <div className={styles.pullQuote}>
                <p>&ldquo;Waterfront properties in Ikoyi have consistently outperformed the broader Lagos market by 18–28% over the past decade. The premium is structural, not cyclical.&rdquo;</p>
                <cite>— RokHaven Market Intelligence Report, Q1 2026</cite>
              </div>
              <p>The supply constraint is real and deliberate. New waterfront plots in Ikoyi are extraordinarily scarce. What comes to market typically does so through off-market introductions — which is precisely why relationships with established brokers are not a luxury but a necessity for serious buyers.</p>
              <h2>Victoria Island: The Commercial Heart with a Residential Soul</h2>
              <p>Victoria Island presents a different proposition. Where Ikoyi is residential in character — quiet, verdant, discreet — VI exists at the intersection of commerce and lifestyle. Its southern edge, however, tells a different story: a stretch of increasingly sophisticated residential developments oriented towards the Atlantic, with amenity profiles that rival comparable product in Dubai or Cape Town.</p>
              <p>The appeal for buyers is the density of service: restaurants, private clubs, medical facilities, financial institutions, and international schools are all within minutes. For the HNWI who conducts business from Lagos but travels frequently, this concentration of infrastructure has a value that transcends simple property metrics.</p>
              <h3>What Drives the Waterfront Premium?</h3>
              <p>Several factors underpin the consistent outperformance of waterfront assets in these markets. First, scarcity: the Lagos waterfront is finite, and no amount of political will or capital can manufacture more of it. Second, amenity: properties with water views or direct water access offer an irreplaceable lifestyle differentiator in a city where space is contested. Third, prestige: in Nigeria&apos;s gift-giving and status-signalling culture, a waterfront address carries social meaning that inland properties, however luxurious, cannot replicate.</p>
              <p>For those prepared to invest the time, establish the right relationships, and engage with the market with genuine patience and discernment, Lagos&apos;s waterfront presents one of Africa&apos;s most compelling luxury real estate opportunities. The window, however, is not open indefinitely.</p>
              <div className={styles.artTags}>
                {['Lagos', 'Ikoyi', 'Victoria Island', 'Waterfront', 'Investment', 'Market Insights'].map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>

            <aside className={styles.artSidebar}>
              <div className={styles.sidebarCard}>
                <div className={styles.sidebarLbl}>About the Author</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className={styles.artAv} style={{ flexShrink: 0 }}>A</div>
                  <div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: 'var(--ivory)', marginBottom: 4 }}>Amara Obi</div>
                    <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.12em', marginBottom: 10 }}>SENIOR PROPERTY ADVISOR</div>
                    <div style={{ fontSize: 12, color: 'rgba(244,237,224,.42)', lineHeight: 1.75, fontWeight: 300 }}>12 years advising ultra-high-net-worth clients on luxury acquisitions across Lagos and Abuja.</div>
                  </div>
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <div className={styles.sidebarLbl}>Related Articles</div>
                {[ARTICLES[1], ARTICLES[2], ARTICLES[4]].map(rel => (
                  <div key={rel.id} className={styles.relPost} onClick={() => openArt(rel)}>
                    <div className={`${styles.relImg} ${rel.gradClass}`} />
                    <div>
                      <h4>{rel.title}</h4>
                      <div className={styles.relMeta}>{rel.catLabel} · {rel.readTime}</div>
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

        {showFeatured && (
          <section className={styles.featuredWrap}>
            <div className={styles.featuredLbl}>Featured</div>
            <article className={styles.featuredCard} onClick={() => openArt(featured)}>
              <div className={`${styles.featImg} ${featured.gradClass}`}>
                <div className={styles.catBadge}>{featured.catLabel}</div>
                <svg width="280" height="280" viewBox="0 0 60 60" fill="#C0A870" style={{ opacity: .06, position: 'relative' }}>
                  <path d={MARK_PATH} />
                </svg>
              </div>
              <div className={styles.featBody}>
                <div>
                  <div className={styles.featMeta}>
                    <span>{featured.date}</span>
                    <span>·</span>
                    <span>{featured.readTime} read</span>
                  </div>
                  <h2>{featured.title}</h2>
                  <p className={styles.featExcerpt}>{featured.excerpt}</p>
                </div>
                <div className={styles.featFooter}>
                  <div className={styles.authorRow}>
                    <div className={styles.authorAv}>{featured.authorInitial}</div>
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
                key={article.id}
                className={styles.acard}
                onClick={() => openArt(article)}
              >
                <div className={`${styles.acardImg} ${article.gradClass}`}>
                  <div className={styles.gradWm}>
                    <svg width="100" height="100" viewBox="0 0 60 60" fill="#C0A870">
                      <path d={MARK_PATH} />
                    </svg>
                  </div>
                  <div className={styles.catBadge}>{article.catLabel}</div>
                </div>
                <div className={styles.acardBody}>
                  <h3>{article.title}</h3>
                  <p className={styles.acardExcerpt}>{article.excerpt}</p>
                  <div className={styles.acardFooter}>
                    <span className={styles.acardMeta}>{article.date} · {article.readTime}</span>
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
