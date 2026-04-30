'use client';

import { useEffect, useRef } from 'react';

// Stats data (would come from API)
const STATE_STATS: Record<string, number> = {
  Lagos: 1420,
  Kano: 980,
  Rivers: 850,
  Oyo: 730,
  FCT: 620,
  Kaduna: 590,
  Enugu: 480,
  Delta: 460,
  Imo: 430,
  Anambra: 410,
  Ogun: 390,
  Borno: 320,
  Katsina: 310,
  Sokoto: 290,
  Kwara: 270,
  Plateau: 260,
  Edo: 250,
  'Cross River': 240,
  Bauchi: 230,
  'Akwa Ibom': 225,
  Adamawa: 210,
  Ondo: 205,
  Osun: 200,
  Niger: 195,
  Benue: 190,
  Gombe: 180,
  Kebbi: 175,
  Nassarawa: 170,
  Yobe: 165,
  Bayelsa: 160,
  Taraba: 155,
  Jigawa: 150,
  Zamfara: 145,
  Ekiti: 140,
  Ebonyi: 135,
  Abia: 130,
};

function getColor(count: number): string {
  if (count >= 1000) return '#166534';
  if (count >= 700) return '#15803d';
  if (count >= 500) return '#16a34a';
  if (count >= 300) return '#22c55e';
  if (count >= 200) return '#4ade80';
  if (count >= 100) return '#86efac';
  return '#dcfce7';
}

interface MapProps {
  onStateClick?: (state: string, count: number) => void;
}

export default function NigeriaMap({ onStateClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mapInstance: any;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapRef.current) return;
      if ((mapRef.current as any)._leaflet_id) return;

      mapInstance = L.map(mapRef.current, {
        center: [9.082, 8.675],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(mapInstance);

      // Load Nigeria GeoJSON
      try {
        const res = await fetch('https://raw.githubusercontent.com/deldersveld/topojson/master/countries/nigeria/nigeria-states.json');
        const topoData = await res.json();
        
        // Convert topojson to geojson using a simple approach
        const topoJson = await import('topojson-client');
        const geojson = topoJson.feature(topoData, topoData.objects[Object.keys(topoData.objects)[0]]);

        L.geoJSON(geojson as any, {
          style: (feature) => {
            const stateName = feature?.properties?.NAME_1 || feature?.properties?.name || '';
            const count = STATE_STATS[stateName] || 0;
            return {
              fillColor: getColor(count),
              weight: 1.5,
              opacity: 1,
              color: '#ffffff',
              fillOpacity: 0.85,
            };
          },
          onEachFeature: (feature, layer) => {
            const stateName = feature.properties?.NAME_1 || feature.properties?.name || 'Unknown';
            const count = STATE_STATS[stateName] || 0;

            layer.bindPopup(`
              <div style="font-family: Inter, sans-serif; min-width: 160px">
                <p style="font-weight: 700; font-size: 14px; color: #0f172a; margin: 0 0 4px">${stateName}</p>
                <p style="font-size: 12px; color: #64748b; margin: 0">${count.toLocaleString()} facilities</p>
              </div>
            `);

            layer.on({
              mouseover: (e) => {
                const l = e.target;
                l.setStyle({ weight: 2.5, color: '#166534', fillOpacity: 0.95 });
                l.bringToFront();
              },
              mouseout: (e) => {
                L.geoJSON(geojson as any).resetStyle(e.target);
              },
              click: () => {
                onStateClick?.(stateName, count);
              },
            });
          },
        }).addTo(mapInstance);
      } catch (e) {
        // Fallback: show simple marker-based Nigeria map
        const nigeriaCenter = L.marker([9.082, 8.675]);
        nigeriaCenter.addTo(mapInstance).bindPopup('Nigeria Health Map').openPopup();
      }

      // Add legend
      const legend = new (L.Control.extend({
        onAdd() {
          const div = L.DomUtil.create('div', 'leaflet-legend');
          div.style.cssText = 'background:white;padding:12px;border-radius:12px;border:1px solid #e2e8f0;font-family:Inter,sans-serif;font-size:11px;box-shadow:0 1px 3px rgba(0,0,0,0.1)';
          div.innerHTML = `
            <p style="font-weight:600;margin:0 0 8px;color:#374151">Facilities per State</p>
            ${[['1000+', '#166534'], ['700-999', '#15803d'], ['500-699', '#16a34a'], ['300-499', '#22c55e'], ['200-299', '#4ade80'], ['100-199', '#86efac'], ['0-99', '#dcfce7']].map(
              ([label, color]) => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="width:12px;height:12px;border-radius:3px;background:${color};display:inline-block"></span><span style="color:#64748b">${label}</span></div>`
            ).join('')}
          `;
          return div;
        },
      }))({ position: 'bottomright' });
      legend.addTo(mapInstance);
    };

    initMap();

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, [onStateClick]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl z-0" />;
}
