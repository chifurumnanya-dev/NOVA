'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Facility } from '@/lib/api';

interface Props {
  facilities: Facility[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Marker size by facility type. Tertiary institutions are largest.
const RADIUS_BY_TYPE: Record<string, number> = {
  teaching_hospital: 11,
  federal_medical_centre: 9,
  specialist_hospital: 7.5,
  general_hospital: 6,
  private_hospital: 5,
  mission_hospital: 5,
  primary_health_centre: 4,
  diagnostic_centre: 4,
  laboratory: 4,
  pharmacy: 3.5,
  maternity_centre: 4,
  dialysis_centre: 4.5,
  emergency_centre: 5,
};

const NIGERIA_CENTER: [number, number] = [9.082, 8.6753];

export default function FacilitiesLeafletMap({ facilities, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: NIGERIA_CENTER,
        zoom: 6,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        pane: 'shadowPane',
      }).addTo(map);

      L.control.attribution({ prefix: false, position: 'bottomright' }).addAttribution('© OSM, © CARTO').addTo(map);

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render markers
  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current || !layerRef.current) return;

      layerRef.current.clearLayers();
      markersRef.current = {};
      const points: [number, number][] = [];

      for (const f of facilities) {
        if (f.latitude == null || f.longitude == null) continue;
        const isSelected = f.id === selectedId;
        const r = RADIUS_BY_TYPE[f.facilityType] ?? 5;
        const verified = f.verificationStatus.includes('verified');

        const marker = L.circleMarker([f.latitude, f.longitude], {
          radius: isSelected ? r * 1.4 : r,
          color: verified ? '#34d399' : '#fbbf24',
          weight: isSelected ? 2.5 : 1,
          fillColor: verified ? '#34d399' : '#fbbf24',
          fillOpacity: isSelected ? 0.95 : 0.7,
        });

        marker.bindTooltip(
          `<div style="font-family: Inter, sans-serif; font-size: 12px;">
            <div style="font-weight: 600; color: #0b0f0d;">${escapeHtml(f.name)}</div>
            <div style="color: #475569; font-size: 11px; margin-top: 2px;">
              ${labelType(f.facilityType)}${f.state?.name ? ' · ' + escapeHtml(f.state.name) : ''}
            </div>
          </div>`,
          { sticky: true, opacity: 1, className: 'nova-tooltip' },
        );

        marker.on('click', () => onSelect(f.id));
        marker.addTo(layerRef.current);
        markersRef.current[f.id] = marker;
        points.push([f.latitude, f.longitude]);
      }

      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        if (points.length > 1) {
          mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
        } else {
          mapRef.current.setView(points[0], 12);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [facilities, onSelect]);

  // Highlight selected
  useEffect(() => {
    if (!mapRef.current) return;
    const marker = selectedId ? markersRef.current[selectedId] : null;
    if (marker) {
      marker.bringToFront();
      const ll = marker.getLatLng();
      mapRef.current.panTo(ll, { animate: true });
    }
  }, [selectedId]);

  return <div ref={containerRef} className="w-full h-full min-h-[300px]" />;
}

function labelType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
