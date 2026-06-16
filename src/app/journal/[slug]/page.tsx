import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from '../page.module.css';
import SanityBody from '../ArticleBody';
import NewsletterForm from '../NewsletterForm';
import { MARK_PATH, CAT_LABELS, STATIC_ARTICLES, Article, formatDate, authorInitial } from '../articles';

const GRAD_CLASSES = [
  styles.grad1, styles.grad2, styles.grad3,
  styles.grad4, styles.grad5, styles.grad6,
];

async function getArticle(slug: string): Promise<{ article: Article; all: Article[] } | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (projectId) {
    try {
      const { client } = await import('@/sanity/client');
      const { postBySlugQuery, allPostsQuery } = await import('@/sanity/queries');
      const [post, all] = await Promise.all([
        client.fetch(postBySlugQuery, { slug }),
        client.fetch(allPostsQuery),
      ]);
      if (post) return { article: post, all: all && all.length > 0 ? all : STATIC_ARTICLES };
    } catch {
      // fall through to static articles
    }
  }
  const article = STATIC_ARTICLES.find(a => a.slug === slug);
  if (!article) return null;
  return { article, all: STATIC_ARTICLES };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getArticle(slug);
  if (!result) notFound();
  const { article, all } = result;

  const idx = all.findIndex(a => a._id === article._id);
  const gradClass = GRAD_CLASSES[(idx === -1 ? 0 : idx) % GRAD_CLASSES.length];
  const related = all.filter(a => a._id !== article._id).slice(0, 3);

  return (
    <>
      <Nav />
      <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
        <header className={styles.artHdr}>
          <div className={styles.artBc}>
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/journal">Journal</Link>
            <span>›</span>
            <span style={{ color: 'rgba(244,237,224,.55)' }}>{CAT_LABELS[article.category]}</span>
          </div>
          <div className={styles.artCat}>{CAT_LABELS[article.category]}</div>
          <h1>{article.title}</h1>
          <p className={styles.artDeck}>{article.excerpt}</p>
          <div className={styles.artByline}>
            <div className={styles.artAv}>{authorInitial(article.author)}</div>
            <div>
              <div className={styles.artAuthor}>{article.author}</div>
              <div className={styles.artDate}>{formatDate(article.publishedAt)} · {article.readTime} read</div>
            </div>
          </div>
        </header>

        {article.coverImageUrl ? (
          <div className={styles.artHero} style={{ backgroundImage: `url(${article.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : (
          <div className={`${styles.artHero} ${gradClass}`}>
            <svg width="320" height="320" viewBox="0 0 60 60" fill="#C0A870">
              <path d={MARK_PATH} />
            </svg>
          </div>
        )}

        <div className={styles.artLayout}>
          <div className={styles.artBody}>
            {article.body && article.body.length > 0 ? (
              <SanityBody body={article.body} />
            ) : (
              <p>{article.excerpt}</p>
            )}
            {article.tags && article.tags.length > 0 && (
              <div className={styles.artTags}>
                {article.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          <aside className={styles.artSidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarLbl}>About the Author</div>
              <div className={styles.artByline} style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className={styles.artAv}>{authorInitial(article.author)}</div>
                <div>
                  <div className={styles.artAuthor}>{article.author}</div>
                  <div className={styles.artDate}>{article.authorRole}</div>
                </div>
              </div>
              {article.authorBio && (
                <p style={{ fontSize: 12.5, color: 'rgba(244,237,224,.42)', lineHeight: 1.75, marginTop: 14 }}>
                  {article.authorBio}
                </p>
              )}
            </div>

            {related.length > 0 && (
              <div className={styles.sidebarCard}>
                <div className={styles.sidebarLbl}>Related Articles</div>
                {related.map(r => (
                  <Link href={`/journal/${r.slug}`} key={r._id} className={styles.relPost}>
                    <div className={`${styles.relImg} ${GRAD_CLASSES[all.findIndex(a => a._id === r._id) % GRAD_CLASSES.length]}`} style={r.coverImageUrl ? { backgroundImage: `url(${r.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
                    <div>
                      <h4>{r.title}</h4>
                      <div className={styles.relMeta}>{formatDate(r.publishedAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className={styles.sidebarCard}>
              <div className={styles.sidebarLbl}>Newsletter</div>
              <NewsletterForm />
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
