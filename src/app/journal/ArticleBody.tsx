import styles from './page.module.css';

const URL_PATTERN = /((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;

function linkify(text: string, key: number | string) {
  const parts = text.split(URL_PATTERN);
  return parts.map((part, i) => {
    if (i % 2 === 1 && part) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a key={`${key}-${i}`} href={href} target="_blank" rel="noopener noreferrer" className={styles.tag} style={{ display: 'inline', border: 'none', padding: 0, color: 'var(--gold)', textDecoration: 'underline' }}>
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function SanityBody({ body }: { body: unknown[] }) {
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
            const content = linkify(c.text, ci);
            if (isBold) return <strong key={ci}>{content}</strong>;
            if (isItalic) return <em key={ci}>{content}</em>;
            return <span key={ci}>{content}</span>;
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
