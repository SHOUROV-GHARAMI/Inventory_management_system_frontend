import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Inventory {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  isPublic: boolean;
  tags: string;
  ownerId: number;
  ownerUsername: string;
  customIdFormat?: string;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
  canEdit: boolean;
}

export interface CreateInventoryDto {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  isPublic: boolean;
  tags: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(private api: ApiService) {}

  getInventories(params?: any): Observable<Inventory[]> {
    return this.api.get<Inventory[]>('inventories', params);
  }

  getInventory(id: number): Observable<Inventory> {
    return this.api.get<Inventory>(`inventories/${id}`);
  }

  getMyInventories(): Observable<Inventory[]> {
    return this.api.get<Inventory[]>('inventories/my');
  }

  getSharedInventories(): Observable<Inventory[]> {
    return this.api.get<Inventory[]>('inventories/shared');
  }

  getLatestInventories(count: number = 10): Observable<Inventory[]> {
    return this.api.get<Inventory[]>('inventories/latest', { count });
  }

  getPopularInventories(count: number = 5): Observable<Inventory[]> {
    return this.api.get<Inventory[]>('inventories/popular', { count });
  }

  createInventory(inventory: CreateInventoryDto): Observable<Inventory> {
    return this.api.post<Inventory>('inventories', inventory);
  }

  updateInventory(id: number, inventory: any): Observable<void> {
    return this.api.put<void>(`inventories/${id}`, inventory);
  }

  deleteInventory(id: number): Observable<void> {
    return this.api.delete<void>(`inventories/${id}`);
  }
}
