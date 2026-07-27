import { Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-draw';
import { Geometry, GeoItem } from '../../../core/geometry';

// Fix Leaflet's default icon path issue with Angular's bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-map-view',
  imports: [CommonModule, FormsModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss'
})
export class MapView implements OnInit, OnChanges {
  geoService = inject(Geometry);

  @Input() activeTool: 'none' | 'point' | 'line' | 'polygon' = 'none';
  @Output() toolUsed = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private map!: L.Map;
  private drawnItems = new L.FeatureGroup();
  private layerById = new Map<string, L.Layer>();
  private activeHandler: any;

  pendingLayer: L.Layer | null = null;
  pendingType: 'Point' | 'LineString' | 'Polygon' | null = null;
  showNameModal = false;
  nameInput = '';
  colorInput = '#2F6B4F';  

  ngOnInit() {
    this.initMap();
    this.geoService.items$.subscribe(items => this.renderAll(items));
    window.addEventListener('geo-zoom-to', (e: any) => this.zoomTo(e.detail));
  }

  ngOnChanges() {
    if (!this.map) return;
    this.toggleDrawTool();
  }

  private initMap() {
    this.map = L.map('map').setView([28.4595, 77.0266], 13); // default: adjust to your area

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.drawnItems.addTo(this.map);

    this.map.on((L as any).Draw.Event.CREATED, (e: any) => {
      this.pendingLayer = e.layer;
      this.pendingType = e.layerType === 'marker' ? 'Point' : e.layerType === 'polyline' ? 'LineString' : 'Polygon';
      this.nameInput = '';
      this.colorInput = '#3388ff';
      this.showNameModal = true;
    });
  }

  private toggleDrawTool() {
    this.activeHandler?.disable?.();
    if (this.activeTool === 'none') return;

    if (this.activeTool === 'point') {
      this.activeHandler = new (L as any).Draw.Marker(this.map);
    } else if (this.activeTool === 'line') {
      this.activeHandler = new (L as any).Draw.Polyline(this.map);
    } else if (this.activeTool === 'polygon') {
      this.activeHandler = new (L as any).Draw.Polygon(this.map);
    }
    this.activeHandler?.enable();
  }

  confirmSave() {
    if (!this.pendingLayer || !this.pendingType) return;

    const layer: any = this.pendingLayer;
    layer.setStyle?.({ color: this.colorInput });

    const geojson = layer.toGeoJSON();
    geojson.properties = { name: this.nameInput || 'Untitled', color: this.colorInput };

    this.geoService.add({
      name: this.nameInput || 'Untitled',
      type: this.pendingType,
      color: this.colorInput,
      geojson
    }).subscribe();

    this.cancelSave();
    this.toolUsed.emit();
  }

  cancelSave() {
    if (this.pendingLayer) this.map.removeLayer(this.pendingLayer);
    this.pendingLayer = null;
    this.pendingType = null;
    this.showNameModal = false;
  }

  private renderAll(items: GeoItem[]) {
    this.drawnItems.clearLayers();
    this.layerById.clear();

    items.forEach(item => {
      const layer = L.geoJSON(item.geojson, {
        style: { color: item.color },
        pointToLayer: (_feat, latlng) => L.circleMarker(latlng, { color: item.color, radius: 8 })
      });
      layer.addTo(this.drawnItems);
      if (item._id) this.layerById.set(item._id, layer);
    });
  }

  zoomTo(id: string) {
    const layer: any = this.layerById.get(id);
    if (layer) this.map.fitBounds(layer.getBounds ? layer.getBounds() : this.map.getBounds());
  }

  triggerImport() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const features = data.type === 'FeatureCollection' ? data.features : [data];

        features.forEach((feature: any, idx: number) => {
          const geomType = feature.geometry.type;
          const type = geomType === 'Point' ? 'Point' : geomType === 'LineString' ? 'LineString' : 'Polygon';
          this.geoService.add({
            name: feature.properties?.name || `Imported ${idx + 1}`,
            type,
            color: '#3388ff',
            geojson: feature
          }).subscribe();
        });
      } catch (err) {
        alert('Invalid GeoJSON file');
      }
    };
    reader.readAsText(file);
  }
}