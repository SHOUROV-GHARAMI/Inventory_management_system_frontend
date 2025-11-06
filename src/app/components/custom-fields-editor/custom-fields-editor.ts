import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomFieldsService, CustomField, FieldType, CreateCustomFieldDto, UpdateCustomFieldDto } from '../../services/custom-fields.service';

@Component({
  selector: 'app-custom-fields-editor',
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-fields-editor.html',
  styleUrl: './custom-fields-editor.scss',
})
export class CustomFieldsEditorComponent implements OnInit {
  @Input() inventoryId!: number;

  fields: CustomField[] = [];
  loading = false;
  error = '';
  showAddModal = false;
  showEditModal = false;
  editingField: CustomField | null = null;

  // New field form
  newFieldName = '';
  newFieldType: FieldType = 'Text';
  newFieldShowInTable = true;

  // Edit field form
  editFieldName = '';
  editFieldShowInTable = true;

  fieldTypes: FieldType[] = ['Text', 'MultilineText', 'Number', 'Link', 'Boolean'];
  draggedField: CustomField | null = null;

  constructor(private customFieldsService: CustomFieldsService) {}

  ngOnInit(): void {
    if (!this.inventoryId) {
      this.error = 'Inventory ID is required.';
      return;
    }
    this.loadFields();
  }

  loadFields(): void {
    this.loading = true;
    this.error = '';

    this.customFieldsService.getFields(this.inventoryId).subscribe({
      next: (data) => {
        this.fields = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load custom fields.';
        this.loading = false;
      }
    });
  }

  openAddModal(): void {
    this.newFieldName = '';
    this.newFieldType = 'Text';
    this.newFieldShowInTable = true;
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(field: CustomField): void {
    this.editingField = field;
    this.editFieldName = field.name;
    this.editFieldShowInTable = field.showInTable;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingField = null;
  }

  addField(): void {
    if (!this.newFieldName.trim()) {
      this.error = 'Field name is required.';
      return;
    }

    // Check 3-per-type limit
    const countOfType = this.fields.filter(f => f.type === this.newFieldType).length;
    if (countOfType >= 3) {
      this.error = `You can only have up to 3 fields of type "${this.newFieldType}".`;
      return;
    }

    const dto: CreateCustomFieldDto = {
      name: this.newFieldName.trim(),
      type: this.newFieldType,
      showInTable: this.newFieldShowInTable
    };

    this.customFieldsService.createField(this.inventoryId, dto).subscribe({
      next: (field) => {
        this.fields.push(field);
        this.fields.sort((a, b) => a.displayOrder - b.displayOrder);
        this.closeAddModal();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create field.';
      }
    });
  }

  updateField(): void {
    if (!this.editingField || !this.editFieldName.trim()) {
      this.error = 'Field name is required.';
      return;
    }

    const dto: UpdateCustomFieldDto = {
      name: this.editFieldName.trim(),
      showInTable: this.editFieldShowInTable
    };

    this.customFieldsService.updateField(this.inventoryId, this.editingField.id, dto).subscribe({
      next: () => {
        const index = this.fields.findIndex(f => f.id === this.editingField!.id);
        if (index !== -1) {
          this.fields[index].name = dto.name;
          this.fields[index].showInTable = dto.showInTable;
        }
        this.closeEditModal();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update field.';
      }
    });
  }

  deleteField(field: CustomField): void {
    if (!confirm(`Are you sure you want to delete the field "${field.name}"? This will remove all associated data from items.`)) {
      return;
    }

    this.customFieldsService.deleteField(this.inventoryId, field.id).subscribe({
      next: () => {
        this.fields = this.fields.filter(f => f.id !== field.id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete field.';
      }
    });
  }

  // Drag and Drop methods
  onDragStart(field: CustomField): void {
    this.draggedField = field;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetField: CustomField): void {
    event.preventDefault();
    
    if (!this.draggedField || this.draggedField.id === targetField.id) {
      return;
    }

    // Reorder fields array
    const draggedIndex = this.fields.findIndex(f => f.id === this.draggedField!.id);
    const targetIndex = this.fields.findIndex(f => f.id === targetField.id);

    // Remove dragged field and insert at target position
    const [removed] = this.fields.splice(draggedIndex, 1);
    this.fields.splice(targetIndex, 0, removed);

    // Update display order
    this.saveFieldOrder();
  }

  onDragEnd(): void {
    this.draggedField = null;
  }

  saveFieldOrder(): void {
    const fieldOrders = this.fields.map((field, index) => ({
      fieldId: field.id,
      displayOrder: index
    }));

    this.customFieldsService.reorderFields(this.inventoryId, { fieldOrders }).subscribe({
      next: () => {
        // Update local display order
        this.fields.forEach((field, index) => {
          field.displayOrder = index;
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save field order.';
        // Reload to revert changes
        this.loadFields();
      }
    });
  }

  getTypeCount(type: FieldType): number {
    return this.fields.filter(f => f.type === type).length;
  }

  canAddType(type: FieldType): boolean {
    return this.getTypeCount(type) < 3;
  }
}
