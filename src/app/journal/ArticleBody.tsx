import styles from './page.module.css';

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
