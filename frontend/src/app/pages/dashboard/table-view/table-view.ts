import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Geometry, GeoItem } from '../../../core/geometry';
import { getMeasurements, getCoordinatesText } from '../../../core/geo-utils';

@Component({
  selector: 'app-table-view',
  imports: [CommonModule],
  templateUrl: './table-view.html',
  styleUrl: './table-view.scss'
})
export class TableView {
  geoService = inject(Geometry);

  measurementLabel(item: GeoItem): string {
    const m = getMeasurements(item);
    if (item.type === 'Polygon') {
      return [m.area, m.length ? `perimeter ${m.length}` : null].filter(Boolean).join(' · ') || '—';
    }
    if (item.type === 'LineString') {
      return m.length || '—';
    }
    return '—';
  }

  coordinatesText(item: GeoItem): string {
    return getCoordinatesText(item);
  }
}