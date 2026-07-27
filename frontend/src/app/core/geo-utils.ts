import GeoJSON from 'ol/format/GeoJSON';
import { getArea, getLength } from 'ol/sphere';
import { GeoItem } from './geometry';

const geojsonFormat = new GeoJSON();

function geometryFor(item: GeoItem) {
  try {
    return geojsonFormat.readGeometry(item.geojson.geometry ?? item.geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:4326'
    });
  } catch {
    return null;
  }
}

function formatLength(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters.toFixed(1)} m`;
}

function formatArea(sqMeters: number): string {
  if (sqMeters >= 1_000_000) return `${(sqMeters / 1_000_000).toFixed(2)} km²`;
  if (sqMeters >= 10_000) return `${(sqMeters / 10_000).toFixed(2)} ha`;
  return `${sqMeters.toFixed(1)} m²`;
}

export interface GeoMeasurements {
  length?: string;
  area?: string;
  coordinateCount?: number;
}

export function getMeasurements(item: GeoItem): GeoMeasurements {
  const geometry = geometryFor(item);
  if (!geometry) return {};

  const type = geometry.getType();

  if (type === 'LineString' || type === 'MultiLineString') {
    const meters = getLength(geometry, { projection: 'EPSG:4326' });
    const coords = (geometry as any).getCoordinates?.() ?? [];
    return {
      length: formatLength(meters),
      coordinateCount: type === 'LineString' ? coords.length : undefined
    };
  }

  if (type === 'Polygon' || type === 'MultiPolygon') {
    const sqMeters = getArea(geometry, { projection: 'EPSG:4326' });
    const perimeter = getLength(geometry, { projection: 'EPSG:4326' });
    const coords = (geometry as any).getCoordinates?.() ?? [];
    return {
      area: formatArea(sqMeters),
      length: formatLength(perimeter),
      coordinateCount: type === 'Polygon' ? coords[0]?.length : undefined
    };
  }

  return {};
}

export function getCoordinates(item: GeoItem): any {
  return item.geojson?.geometry?.coordinates ?? item.geojson?.coordinates ?? null;
}

export function getCoordinatesText(item: GeoItem): string {
  const coords = getCoordinates(item);
  return coords ? JSON.stringify(coords) : '—';
}
