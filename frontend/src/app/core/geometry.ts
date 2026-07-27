import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

const API = 'http://localhost:5000/api/geometries';

export interface GeoItem {
  _id?: string;
  name: string;
  type: 'Point' | 'LineString' | 'Polygon';
  color: string;
  geojson: any;
  createdAt?: string;
}

@Service()
export class Geometry {
  private http = inject(HttpClient);
  private itemsSubject = new BehaviorSubject<GeoItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  load() {
    this.http.get<GeoItem[]>(API).subscribe(items => this.itemsSubject.next(items));
  }

  add(item: GeoItem) {
    return this.http.post<GeoItem>(API, item).pipe(
      tap(saved => this.itemsSubject.next([saved, ...this.itemsSubject.value]))
    );
  }

  update(id: string, changes: Partial<GeoItem>) {
    return this.http.put<GeoItem>(`${API}/${id}`, changes).pipe(
      tap(updated => {
        const items = this.itemsSubject.value.map(i => i._id === id ? updated : i);
        this.itemsSubject.next(items);
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${API}/${id}`).pipe(
      tap(() => {
        this.itemsSubject.next(this.itemsSubject.value.filter(i => i._id !== id));
      })
    );
  }

  get current() {
    return this.itemsSubject.value;
  }
}