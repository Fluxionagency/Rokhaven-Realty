'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './penthouse.module.css';

interface Props {
  youtubeId: string;
  poster: string;
  label: string;
  small?: boolean;
}

export default function YoutubeShort({ youtubeId, poster, label, small }: Props) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  // Intersection observer: auto-load when 80% visible
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setLoaded(true); },
      { threshold: 0.8 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoaded(true);
  };

  const iframeSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className={`${styles.videoWrap}${small ? ' ' + styles.videoSmall : ''}`}>
      <a
        ref={ref}
        href={`https://www.youtube.com/shorts/${youtubeId}`}
        aria-label="Watch the walkthrough on YouTube"
        className={styles.videoFacade}
        onClick={handleClick}
      >
        {loaded ? (
          <iframe
            src={iframeSrc}
            title="Property walkthrough"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <>
            <Image src={poster} alt="" fill style={{ objectFit: 'cover', opacity: 0.55 }} sizes="340px" />
            <span className={styles.videoOverlay}>
              <svg width="68" height="68" viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r="30" fill="rgba(6,15,28,0.6)" stroke="#C0A870" strokeWidth="1.5" />
                <path d="M26 21l18 11-18 11z" fill="#C0A870" />
              </svg>
              <span className={styles.videoLabel}>{label}</span>
            </span>
          </>
        )}
      </a>
    </div>
  );
}
