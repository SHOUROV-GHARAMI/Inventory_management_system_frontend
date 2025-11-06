import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Item {
  id: number;
  inventoryId: number;
  customId: string;
  fieldValues: { [fieldId: string]: any };
  likeCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateItemDto {
  fieldValues: { [fieldId: string]: any };
}

export interface UpdateItemDto {
  fieldValues: { [fieldId: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  constructor(private api: ApiService) {}

  getItems(inventoryId: number, params?: any): Observable<Item[]> {
    return this.api.get<Item[]>(`inventories/${inventoryId}/items`, params);
  }

  getItem(itemId: number): Observable<Item> {
    return this.api.get<Item>(`items/${itemId}`);
  }

  createItem(inventoryId: number, item: CreateItemDto): Observable<Item> {
    return this.api.post<Item>(`inventories/${inventoryId}/items`, item);
  }

  updateItem(itemId: number, item: UpdateItemDto): Observable<void> {
    return this.api.put<void>(`items/${itemId}`, item);
  }

  deleteItem(itemId: number): Observable<void> {
    return this.api.delete<void>(`items/${itemId}`);
  }

  likeItem(itemId: number): Observable<void> {
    return this.api.post<void>(`items/${itemId}/like`, {});
  }

  unlikeItem(itemId: number): Observable<void> {
    return this.api.delete<void>(`items/${itemId}/like`);
  }
}
