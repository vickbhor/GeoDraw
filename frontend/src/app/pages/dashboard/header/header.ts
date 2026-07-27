import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private auth = inject(Auth);
  private router = inject(Router);

  @Input() activeTool: string = 'none';
  @Input() view: string = 'map';
  @Output() toolChange = new EventEmitter<'none' | 'point' | 'line' | 'polygon'>();
  @Output() viewChange = new EventEmitter<'map' | 'table'>();

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}