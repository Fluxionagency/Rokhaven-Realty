'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  inputStyle?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
}

// Module-level singleton — script loads only once per page lifecycle
let mapsLoaded = false;
let mapsLoading = false;
const pendingCbs: Array<() => void> = [];

function loadMaps(apiKey: string, cb: () => void) {
  if (mapsLoaded) { cb(); return; }
  pendingCbs.push(cb);
  if (mapsLoading) return;
  mapsLoading = true;

  (window as any).__rokhavenMapsReady = () => {
    mapsLoaded = true;
    mapsLoading = false;
    pendingCbs.forEach((fn) => fn());
    pendingCbs.length = 0;
  };

  const s = document.createElement('script');
  s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__rokhavenMapsReady`;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Type a location…',
  inputStyle,
  wrapperStyle,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<any>(null);
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => { setInputVal(value); }, [value]);

  const initAC = useCallback(() => {
    const google = (window as any).google;
    if (!google?.maps?.places || !inputRef.current || acRef.current) return;

    acRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ng' },
      fields: ['name', 'address_components'],
      types: ['geocode'],
    });

    acRef.current.addListener('place_changed', () => {
      const place = acRef.current.getPlace();
      const components: any[] = place.address_components || [];

      // Pick the most specific area name (sublocality > neighborhood > locality > name)
      const pick = (types: string[]) =>
        components.find((c) => types.some((t) => c.types.includes(t)))?.long_name;

      const name =
        pick(['sublocality_level_1', 'sublocality']) ||
        pick(['neighborhood']) ||
        place.name ||
        pick(['locality']) ||
        '';

      setInputVal(name);
      onChange(name);
    });
  }, [onChange]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || typeof window === 'undefined') return;
    loadMaps(key, initAC);
  }, [initAC]);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...wrapperStyle }}>
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value); }}
        placeholder={placeholder}
        style={inputStyle}
        autoComplete="off"
        spellCheck={false}
      />
      {inputVal && (
        <button
          type="button"
          onClick={() => { setInputVal(''); onChange(''); inputRef.current?.focus(); }}
          style={{
            position: 'absolute',
            right: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(244,237,224,0.45)',
            fontSize: '16px',
            lineHeight: 1,
            padding: '0 6px',
            flexShrink: 0,
          }}
          aria-label="Clear"
        >
          ×
        </button>
      )}
    </div>
  );
}
