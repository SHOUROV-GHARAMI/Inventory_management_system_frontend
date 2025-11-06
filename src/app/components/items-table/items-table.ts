import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService, Item, CreateItemDto } from '../../services/items.service';
import { CustomFieldsService, CustomField } from '../../services/custom-fields.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-items-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './items-table.html',
  styleUrl: './items-table.scss',
})
export class ItemsTableComponent implements OnInit {
  @Input() inventoryId!: number;
  @Input() canEdit: boolean = false;

  items: Item[] = [];
  fields: CustomField[] = [];
  tableFields: CustomField[] = [];
  loading = false;
  error = '';
  showAddModal = false;
  showEditModal = false;
  editingItem: Item | null = null;
  newItemValues: { [fieldId: string]: any } = {};
  editItemValues: { [fieldId: string]: any } = {};

  constructor(
    private itemsService: ItemsService,
    private customFieldsService: CustomFieldsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.inventoryId) {
      this.error = 'Inventory ID is required.';
      return;
    }

    this.loadFields();
    this.loadItems();
  }

  loadFields(): void {
    this.customFieldsService.getFields(this.inventoryId).subscribe({
      next: (data) => {
        this.fields = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.tableFields = this.fields.filter(f => f.showInTable);
      },
      error: (err) => {
        console.error('Failed to load fields:', err);
      }
    });
  }

  loadItems(): void {
    this.loading = true;
    this.error = '';

    this.itemsService.getItems(this.inventoryId).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load items.';
        this.loading = false;
      }
    });
  }

  openAddModal(): void {
    this.newItemValues = {};
    // Initialize with empty values
    this.fields.forEach(field => {
      this.newItemValues[field.id] = field.type === 'Boolean' ? false : '';
    });
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newItemValues = {};
  }

  openEditModal(item: Item): void {
    this.editingItem = item;
    this.editItemValues = { ...item.fieldValues };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingItem = null;
    this.editItemValues = {};
  }

  addItem(): void {
    const dto: CreateItemDto = {
      fieldValues: this.newItemValues
    };

    this.itemsService.createItem(this.inventoryId, dto).subscribe({
      next: (item) => {
        this.items.push(item);
        this.closeAddModal();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create item.';
      }
    });
  }

  updateItem(): void {
    if (!this.editingItem) return;

    this.itemsService.updateItem(this.editingItem.id, { fieldValues: this.editItemValues }).subscribe({
      next: () => {
        // Update the item in the list
        const index = this.items.findIndex(i => i.id === this.editingItem!.id);
        if (index !== -1) {
          this.items[index].fieldValues = { ...this.editItemValues };
        }
        this.closeEditModal();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update item.';
      }
    });
  }

  deleteItem(item: Item): void {
    if (!confirm(`Are you sure you want to delete item ${item.customId}?`)) {
      return;
    }

    this.itemsService.deleteItem(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== item.id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete item.';
      }
    });
  }

  toggleLike(item: Item): void {
    if (item.isLikedByCurrentUser) {
      this.itemsService.unlikeItem(item.id).subscribe({
        next: () => {
          item.isLikedByCurrentUser = false;
          item.likeCount--;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to unlike item.';
        }
      });
    } else {
      this.itemsService.likeItem(item.id).subscribe({
        next: () => {
          item.isLikedByCurrentUser = true;
          item.likeCount++;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to like item.';
        }
      });
    }
  }

  getFieldValue(item: Item, fieldId: number): any {
    return item.fieldValues[fieldId] || '';
  }

  getFieldDisplayValue(item: Item, field: CustomField): string {
    const value = this.getFieldValue(item, field.id);
    
    if (field.type === 'Boolean') {
      return value ? 'Yes' : 'No';
    }
    if (field.type === 'Link' && value) {
      return value;
    }
    return value || '-';
  }
}
