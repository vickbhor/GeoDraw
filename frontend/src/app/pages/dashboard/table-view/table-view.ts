import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Geometry } from '../../../core/geometry';

@Component({
  selector: 'app-table-view',
  imports: [CommonModule],
  templateUrl: './table-view.html',
  styleUrl: './table-view.scss'
})
export class TableView {
  geoService = inject(Geometry);
}