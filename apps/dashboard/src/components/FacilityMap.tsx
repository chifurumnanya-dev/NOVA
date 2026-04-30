'use client';

import { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lon: number;
  name: string;
}

export default function FacilityMap({ lat, lon, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [lat, lon],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lon]).addTo(map).bindPopup(name).openPopup();

      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, name]);

  return <div ref={containerRef} className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-200" />;
}
