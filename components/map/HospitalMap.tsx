'use client';

import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, DEFAULT_CENTER, DEFAULT_ZOOM, buildRadiusGeoJSON } from '@/lib/mapbox';
import type { Hospital } from '@/lib/types';

interface HospitalMapProps {
  hospitals: Hospital[];
  userLocation?: [number, number] | null;
  radiusKm?: number | null;
  onMarkerClick: (hospitalId: string) => void;
}

const CLUSTER_THRESHOLD = 50;

export function HospitalMap({ hospitals, userLocation, radiusKm, onMarkerClick }: HospitalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  // Build GeoJSON from hospitals that have coordinates
  const buildGeoJSON = useCallback(
    (items: Hospital[]): GeoJSON.FeatureCollection => ({
      type: 'FeatureCollection',
      features: items
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((h) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [h.longitude!, h.latitude!] },
          properties: { id: h.id, name: h.name },
        })),
    }),
    []
  );

  // Initialise map once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userLocation ?? DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      const useClustering = hospitals.length > CLUSTER_THRESHOLD;

      // Hospital markers source
      map.addSource('hospitals', {
        type: 'geojson',
        data: buildGeoJSON(hospitals),
        cluster: useClustering,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      if (useClustering) {
        // Cluster bubble
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'hospitals',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#059669',
            'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 30],
            'circle-opacity': 0.85,
          },
        });

        // Cluster count label
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'hospitals',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 12,
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          },
          paint: { 'text-color': '#ffffff' },
        });

        // Click cluster to zoom in
        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          const clusterId = features[0]?.properties?.['cluster_id'] as number | undefined;
          if (clusterId == null) return;
          (map.getSource('hospitals') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err || zoom == null) return;
              const coords = (features[0]?.geometry as GeoJSON.Point).coordinates as [
                number,
                number,
              ];
              map.easeTo({ center: coords, zoom });
            }
          );
        });

        map.on('mouseenter', 'clusters', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'clusters', () => (map.getCanvas().style.cursor = ''));
      }

      // Individual hospital markers (unclustered or when clustering disabled)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'hospitals',
        filter: useClustering ? ['!', ['has', 'point_count']] : ['all'],
        paint: {
          'circle-color': '#059669',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Hospital name tooltip on hover
      const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
      map.on('mouseenter', 'unclustered-point', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features?.[0];
        if (!feature) return;
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
        const name = feature.properties?.['name'] as string;
        popup.setLngLat(coords).setHTML(`<p class="text-sm font-medium">${name}</p>`).addTo(map);
      });
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

      // Click individual hospital — notify parent
      map.on('click', 'unclustered-point', (e) => {
        const id = e.features?.[0]?.properties?.['id'] as string | undefined;
        if (id) onMarkerClickRef.current(id);
      });

      // Radius circle source/layer
      map.addSource('radius', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius',
        paint: { 'fill-color': '#059669', 'fill-opacity': 0.1 },
      });
      map.addLayer({
        id: 'radius-border',
        type: 'line',
        source: 'radius',
        paint: { 'line-color': '#059669', 'line-width': 2, 'line-opacity': 0.6 },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Intentionally run only on mount — hospital/location updates handled separately below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update hospital markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource('hospitals') as mapboxgl.GeoJSONSource | undefined;
    source?.setData(buildGeoJSON(hospitals));
  }, [hospitals, buildGeoJSON]);

  // Update radius circle when location or radius changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource('radius') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    if (userLocation && radiusKm) {
      source.setData(buildRadiusGeoJSON(userLocation, radiusKm) as GeoJSON.Feature);
      map.easeTo({ center: userLocation, zoom: Math.max(10, 14 - Math.log2(radiusKm)) });
    } else {
      source.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [userLocation, radiusKm]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      aria-label="Hospital map"
      role="application"
    />
  );
}
