'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { MARK_PATH, CAT_LABELS, STATIC_ARTICLES, Article, formatDate, authorInitial } from './articles';

const GRAD_CLASSES = [
  styles.grad1, styles.grad2, styles.grad3,
  styles.grad4, styles.grad5, styles.grad6,
];

export default function JournalPage() {
  const [activeFilter, setActiveFilter] = useState('all');
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
            <Link href={`/journal/${featured.slug}`} className={styles.featuredCard}>
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
            </Link>
          </section>
        )}

        <section className={styles.gridSection}>
          <div className={styles.gridLbl}>Latest Articles</div>
          <div className={styles.articleGrid}>
            {visibleGrid.map(article => (
              <Link
                href={`/journal/${article.slug}`}
                key={article._id}
                className={styles.acard}
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
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
