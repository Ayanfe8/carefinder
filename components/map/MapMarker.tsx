'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapMarkerProps {
  map: mapboxgl.Map;
  longitude: number;
  latitude: number;
  hospitalId: string;
  name: string;
  onClick: (hospitalId: string) => void;
}

// Renderless component — imperatively adds a Mapbox marker and popup to the map.
// Used for highlighted/selected markers; bulk rendering uses GeoJSON layers.
export function MapMarker({ map, longitude, latitude, hospitalId, name, onClick }: MapMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
      `<p class="font-medium text-sm text-gray-900">${name}</p>`
    );

    const marker = new mapboxgl.Marker({ color: '#059669' })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map);

    const el = marker.getElement();
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => onClick(hospitalId));

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, longitude, latitude, hospitalId, name, onClick]);

  return null;
}
