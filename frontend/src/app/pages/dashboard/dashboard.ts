import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { MapView } from './map-view/map-view';
import { TableView } from './table-view/table-view';
import { Geometry } from '../../core/geometry';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Header, Sidebar, MapView, TableView],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private geoService = inject(Geometry);

  view: 'map' | 'table' = 'map';
  activeTool: 'none' | 'point' | 'line' | 'polygon' = 'none';

  ngOnInit() {
    this.geoService.load();
  }

  setTool(tool: 'none' | 'point' | 'line' | 'polygon') {
    this.activeTool = this.activeTool === tool ? 'none' : tool;
  }

  setView(v: 'map' | 'table') {
    this.view = v;
  }
}