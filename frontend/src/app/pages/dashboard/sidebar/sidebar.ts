import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Geometry, GeoItem } from '../../../core/geometry';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  geoService = inject(Geometry);

  openMenuId: string | null = null;
  menuTop = 0;
  menuLeft = 0;

  editingId: string | null = null;
  editName = '';
  editColor = '#2F6B4F';

  toggleMenu(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.openMenuId === id) {
      this.openMenuId = null;
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 150;
    const menuHeight = 132;

    // right-align to the button, flip upward if it would overflow the bottom of the viewport
    let top = rect.bottom + 4;
    let left = rect.right - menuWidth;

    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }
    if (left < 8) left = 8;

    this.menuTop = top;
    this.menuLeft = left;
    this.openMenuId = id;
  }

  @HostListener('document:click')
  closeMenu() {
    this.openMenuId = null;
  }

  view(item: GeoItem) {
    this.openMenuId = null;
    window.dispatchEvent(new CustomEvent('geo-zoom-to', { detail: item._id }));
  }

  startEdit(item: GeoItem) {
    this.openMenuId = null;
    this.editingId = item._id!;
    this.editName = item.name;
    this.editColor = item.color;
  }

  saveEdit(item: GeoItem) {
    if (!this.editName.trim()) return;
    this.geoService.update(item._id!, { name: this.editName.trim(), color: this.editColor }).subscribe();
    this.editingId = null;
  }

  cancelEdit() {
    this.editingId = null;
  }

  remove(item: GeoItem) {
    this.openMenuId = null;
    if (confirm(`Delete "${item.name}"?`)) {
      this.geoService.delete(item._id!).subscribe();
    }
  }
}