'use client';

import { useRef } from 'react';
import { trackVideoStart } from '@/lib/tracking';
import styles from './funnel.module.css';

export default function GroundUpVideo({ src, poster }: { src: string; poster: string }) {
  const fired = useRef(false);
  return (
    <div className={styles['video-frame']}>
      <video
        src={src}
        poster={poster}
        controls
        playsInline
        preload="none"
        aria-label="Falcon: from the ground up, a one-minute site film with voiceover"
        onPlay={() => {
          if (fired.current) return;
          fired.current = true;
          trackVideoStart();
        }}
      />
    </div>
  );
}
