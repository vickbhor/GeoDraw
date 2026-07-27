import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, OnChanges, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import Feature, { FeatureLike } from 'ol/Feature';
import { Draw } from 'ol/interaction';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import MultiPoint from 'ol/geom/MultiPoint';
import { fromLonLat } from 'ol/proj';

import { Geometry, GeoItem } from '../../../core/geometry';

type ToolType = 'none' | 'point' | 'line' | 'polygon';
type GeomType = 'Point' | 'LineString' | 'Polygon';

const DEFAULT_COLOR = '#2F6B4F';

@Component({
  selector: 'app-map-view',
  imports: [CommonModule, FormsModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss'
})
export class MapView implements OnInit, OnChanges, OnDestroy {
  geoService = inject(Geometry);

  @Input() activeTool: ToolType = 'none';
  @Output() toolUsed = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private map!: OlMap;
  private drawnSource = new VectorSource();
  private drawInteraction: Draw | null = null;
  private featureById = new Map<string, Feature>();
  private geojsonFormat = new GeoJSON();
  private zoomListener = (e: Event) => this.zoomTo((e as CustomEvent).detail);

  pendingFeature: Feature | null = null;
  pendingType: GeomType | null = null;
  showNameModal = false;
  nameInput = '';
  colorInput = DEFAULT_COLOR;

  ngOnInit() {
    this.initMap();
    this.geoService.items$.subscribe(items => this.renderAll(items));
    window.addEventListener('geo-zoom-to', this.zoomListener);
  }

  ngOnChanges() {
    if (!this.map) return;
    this.toggleDrawTool();
  }

  ngOnDestroy() {
    window.removeEventListener('geo-zoom-to', this.zoomListener);
    this.map?.setTarget(undefined);
  }

  private initMap() {
    const vectorLayer = new VectorLayer({
      source: this.drawnSource,
      style: feature => this.styleForFeature(feature)
    });

    this.map = new OlMap({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer
      ],
      view: new OlView({
        center: fromLonLat([77.0266, 28.4595]), // default: adjust to your area
        zoom: 13,
        maxZoom: 19
      })
    });
  }

  private styleForFeature(feature: FeatureLike): Style {
    const color = (feature.get('color') as string) || DEFAULT_COLOR;
    const type = feature.getGeometry()?.getType();

    if (type === 'Point') {
      return new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      });
    }
    if (type === 'LineString') {
      return new Style({ stroke: new Stroke({ color, width: 3 }) });
    }
    return new Style({
      fill: new Fill({ color: this.withAlpha(color) }),
      stroke: new Stroke({ color, width: 2 })
    });
  }

  private sketchStyle = (feature: FeatureLike): Style[] => {
    const color = this.colorInput;
    const type = feature.getGeometry()?.getType();
    const styles: Style[] = [];

    if (type === 'Polygon') {
      styles.push(new Style({
        fill: new Fill({ color: this.withAlpha(color) }),
        stroke: new Stroke({ color, width: 2, lineDash: [6, 6] })
      }));
    } else if (type === 'LineString') {
      styles.push(new Style({ stroke: new Stroke({ color, width: 2, lineDash: [6, 6] }) }));
    }

    styles.push(new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: '#ffffff', width: 1.5 })
      }),
      geometry: (feat: FeatureLike) => {
        const geom = feat.getGeometry() as any;
        const geomType = geom?.getType();
        if (geomType === 'Point') return geom;
        if (geomType === 'LineString') return new MultiPoint(geom.getCoordinates());
        if (geomType === 'Polygon') return new MultiPoint(geom.getCoordinates()[0]);
        return undefined;
      }
    }));

    return styles;
  };

  private withAlpha(hex: string): string {
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}33` : hex;
  }

  private toggleDrawTool() {
    if (this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }
    if (this.activeTool === 'none') return;

    this.colorInput = DEFAULT_COLOR;
    const olType = this.activeTool === 'point' ? 'Point' : this.activeTool === 'line' ? 'LineString' : 'Polygon';

    this.drawInteraction = new Draw({
      source: this.drawnSource,
      type: olType,
      style: this.sketchStyle
    });

    this.drawInteraction.on('drawend', (evt: any) => {
      const feature = evt.feature as Feature;
      feature.set('color', this.colorInput);
      this.pendingFeature = feature;
      this.pendingType = olType as GeomType;
      this.nameInput = '';
      this.showNameModal = true;
      // Feature is inserted into drawnSource right after this handler returns,
      // so it's visible on the map immediately — the name prompt appears alongside it,
      // not before it.
    });

    this.map.addInteraction(this.drawInteraction);
  }

  onColorChange(color: string) {
    this.colorInput = color;
    this.pendingFeature?.set('color', color);
  }

  confirmSave() {
    if (!this.pendingFeature || !this.pendingType) return;

    const feature = this.pendingFeature;
    const name = this.nameInput.trim() || 'Untitled';
    const color = this.colorInput;
    feature.set('color', color);

    const geojson = this.geojsonFormat.writeFeatureObject(feature, {
      dataProjection: 'EPSG:4326',
      featureProjection: this.map.getView().getProjection()
    });
    geojson.properties = { name, color };

    this.geoService.add({
      name,
      type: this.pendingType,
      color,
      geojson
    }).subscribe({
      error: () => {
        alert('Could not save this shape. Please try again.');
        this.drawnSource.removeFeature(feature);
      }
    });

    this.pendingFeature = null;
    this.pendingType = null;
    this.showNameModal = false;
    this.toolUsed.emit();
  }

  cancelSave() {
    if (this.pendingFeature) this.drawnSource.removeFeature(this.pendingFeature);
    this.pendingFeature = null;
    this.pendingType = null;
    this.showNameModal = false;
  }

  private renderAll(items: GeoItem[]) {
    this.drawnSource.clear();
    this.featureById.clear();

    items.forEach(item => {
      let feature: Feature;
      try {
        feature = this.geojsonFormat.readFeature(item.geojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: this.map.getView().getProjection()
        }) as Feature;
      } catch {
        return;
      }
      feature.set('color', item.color);
      if (item._id) {
        feature.setId(item._id);
        this.featureById.set(item._id, feature);
      }
      this.drawnSource.addFeature(feature);
    });
  }

  zoomTo(id: string) {
    const feature = this.featureById.get(id);
    const geometry = feature?.getGeometry();
    if (!geometry) return;
    this.map.getView().fit(geometry.getExtent(), {
      padding: [80, 80, 80, 80],
      maxZoom: 17,
      duration: 450
    });
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
            color: DEFAULT_COLOR,
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
