import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type FieldType = 'Text' | 'MultilineText' | 'Number' | 'Link' | 'Boolean';

export interface CustomField {
  id: number;
  inventoryId: number;
  name: string;
  type: FieldType;
  showInTable: boolean;
  displayOrder: number;
}

export interface CreateCustomFieldDto {
  name: string;
  type: FieldType;
  showInTable: boolean;
}

export interface UpdateCustomFieldDto {
  name: string;
  showInTable: boolean;
}

export interface ReorderFieldsDto {
  fieldOrders: { fieldId: number; displayOrder: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomFieldsService {
  constructor(private api: ApiService) {}

  getFields(inventoryId: number): Observable<CustomField[]> {
    return this.api.get<CustomField[]>(`inventories/${inventoryId}/fields`);
  }

  createField(inventoryId: number, field: CreateCustomFieldDto): Observable<CustomField> {
    return this.api.post<CustomField>(`inventories/${inventoryId}/fields`, field);
  }

  updateField(inventoryId: number, fieldId: number, field: UpdateCustomFieldDto): Observable<void> {
    return this.api.put<void>(`inventories/${inventoryId}/fields/${fieldId}`, field);
  }

  deleteField(inventoryId: number, fieldId: number): Observable<void> {
    return this.api.delete<void>(`inventories/${inventoryId}/fields/${fieldId}`);
  }

  reorderFields(inventoryId: number, reorder: ReorderFieldsDto): Observable<void> {
    return this.api.put<void>(`inventories/${inventoryId}/fields/reorder`, reorder);
  }
}
