'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './penthouse.module.css';
import type { FloorLevel, WalkthroughChapter } from '../_config/penthouses';

interface Props {
  label?: string;
  heading: string;
  floors: FloorLevel[];
}

export default function FloorExplorer({ label, heading, floors }: Props) {
  const [active, setActive] = useState(0);
  const floor = floors[active];

  return (
    <section className={styles.walkthrough}>
      <div className={styles.walkthroughInner}>
        <div className={styles.walkthroughHead}>
          {label && <p className={styles.sectionLabelGold}>{label}</p>}
          <h2 className={styles.walkthroughH2}>{heading}</h2>
        </div>
        <div className={styles.floorExplorer}>
          <div className={styles.floorButtons}>
            {floors.map((f, i) => (
              <button
                key={f.id}
                className={styles.floorBtn}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <span className={styles.floorBtnNum}>{f.num}</span>
                <span className={styles.floorBtnMeta}>
                  <span className={styles.floorBtnTag}>{f.tag}</span>
                  <span className={styles.floorBtnName}>{f.name}</span>
                </span>
              </button>
            ))}
            <p className={styles.floorElevator}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 2v20M5 9l7-7 7 7M5 15l7 7 7-7" />
              </svg>
              Private lift access to all floors
            </p>
          </div>
          <div className={styles.floorPanel}>
            <Image
              key={floor.img}
              src={floor.img}
              alt={floor.alt}
              width={900}
              height={506}
              style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }}
            />
            <p className={styles.floorPanelLabel}>{floor.tag} · {floor.name}</p>
            <h3 className={styles.floorPanelH3}>{floor.headline}</h3>
            <p className={styles.floorPanelBody}>{floor.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
