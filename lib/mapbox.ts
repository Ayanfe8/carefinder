export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Default map center: Lagos, Nigeria
export const DEFAULT_CENTER: [number, number] = [3.3792, 6.5244];
export const DEFAULT_ZOOM = 10;
export const CLUSTER_THRESHOLD = 50;

export interface MarkerFeature {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
}

export function buildMarkersGeoJSON(markers: MarkerFeature[]) {
  return {
    type: 'FeatureCollection' as const,
    features: markers.map((m) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [m.longitude, m.latitude] as [number, number],
      },
      properties: { id: m.id, name: m.name },
    })),
  };
}

// Approximate GeoJSON circle polygon for radius overlay.
// Uses equirectangular projection — accurate enough at Nigeria's latitudes.
export function buildRadiusGeoJSON(
  center: [number, number],
  radiusKm: number
) {
  const points = 64;
  const distX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distY = radiusKm / 110.574;
  const coords: [number, number][] = Array.from({ length: points }, (_, i) => {
    const theta = (i / points) * 2 * Math.PI;
    return [
      center[0] + distX * Math.cos(theta),
      center[1] + distY * Math.sin(theta),
    ];
  });
  coords.push(coords[0]!);

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords],
    },
    properties: {},
  };
}
