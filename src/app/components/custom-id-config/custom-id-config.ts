import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

interface IdComponent {
  type: 'TEXT' | 'RANDOM' | 'GUID' | 'DATE' | 'SEQUENCE';
  value?: string; // For TEXT type
  bits?: number; // For RANDOM type: 6, 9, 20, 32
  format?: string; // For DATE type: yyyy-MM-dd, etc.
}

interface IdFormatPreview {
  preview: string;
  examples: string[];
}

@Component({
  selector: 'app-custom-id-config',
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-id-config.html',
  styleUrl: './custom-id-config.scss'
})
export class CustomIdConfigComponent implements OnInit {
  @Input() inventoryId!: number;
  @Input() currentFormat: string = '';
  @Input() canEdit = false;

  components: IdComponent[] = [];
  preview: IdFormatPreview = { preview: '', examples: [] };
  loading = false;
  saving = false;

  // Drag and drop
  draggedIndex: number | null = null;

  constructor(
    private api: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.currentFormat) {
      this.parseFormat(this.currentFormat);
    }
    this.updatePreview();
  }

  parseFormat(format: string): void {
    // Simple parsing - in real implementation, would parse the format string
    // For now, start with empty if format exists
    if (format && format !== 'ITEM-{SEQ:5}') {
      this.components = [
        { type: 'TEXT', value: 'ITEM' },
        { type: 'TEXT', value: '-' },
        { type: 'SEQUENCE' }
      ];
    }
  }

  addComponent(type: IdComponent['type']): void {
    const component: IdComponent = { type };
    
    // Set defaults
    switch (type) {
      case 'TEXT':
        component.value = '';
        break;
      case 'RANDOM':
        component.bits = 6;
        break;
      case 'DATE':
        component.format = 'yyyyMMdd';
        break;
    }

    this.components.push(component);
    this.updatePreview();
  }

  removeComponent(index: number): void {
    this.components.splice(index, 1);
    this.updatePreview();
  }

  moveUp(index: number): void {
    if (index > 0) {
      [this.components[index], this.components[index - 1]] = 
      [this.components[index - 1], this.components[index]];
      this.updatePreview();
    }
  }

  moveDown(index: number): void {
    if (index < this.components.length - 1) {
      [this.components[index], this.components[index + 1]] = 
      [this.components[index + 1], this.components[index]];
      this.updatePreview();
    }
  }

  // Drag and drop handlers
  onDragStart(index: number): void {
    this.draggedIndex = index;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
      const draggedItem = this.components[this.draggedIndex];
      this.components.splice(this.draggedIndex, 1);
      
      // Adjust target index if needed
      const adjustedIndex = this.draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      this.components.splice(adjustedIndex, 0, draggedItem);
      
      this.updatePreview();
    }
    this.draggedIndex = null;
  }

  onDragEnd(): void {
    this.draggedIndex = null;
  }

  updatePreview(): void {
    if (this.components.length === 0) {
      this.preview = { preview: 'No components added', examples: [] };
      return;
    }

    const format = this.buildFormatString();
    
    this.api.post<IdFormatPreview>('custom-id/preview', { format }).subscribe({
      next: (data) => {
        this.preview = data;
      },
      error: () => {
        // Generate client-side preview if API fails
        this.preview = {
          preview: this.generateClientPreview(),
          examples: []
        };
      }
    });
  }

  buildFormatString(): string {
    return this.components.map(c => {
      switch (c.type) {
        case 'TEXT':
          return c.value || '';
        case 'RANDOM':
          return `{RANDOM:${c.bits || 6}}`;
        case 'GUID':
          return '{GUID}';
        case 'DATE':
          return `{DATE:${c.format || 'yyyyMMdd'}}`;
        case 'SEQUENCE':
          return '{SEQ:5}';
        default:
          return '';
      }
    }).join('');
  }

  generateClientPreview(): string {
    return this.components.map(c => {
      switch (c.type) {
        case 'TEXT':
          return c.value || '[text]';
        case 'RANDOM':
          return 'XXXXX';
        case 'GUID':
          return 'xxxxxxxx-xxxx-xxxx';
        case 'DATE':
          return '20251105';
        case 'SEQUENCE':
          return '00001';
        default:
          return '';
      }
    }).join('');
  }

  saveFormat(): void {
    if (!this.canEdit) {
      this.notification.warning('You do not have permission to edit this inventory');
      return;
    }

    if (this.components.length === 0) {
      this.notification.warning('Please add at least one component');
      return;
    }

    const format = this.buildFormatString();
    this.saving = true;

    this.api.put(`inventories/${this.inventoryId}`, {
      customIdFormat: format
    }).subscribe({
      next: () => {
        this.notification.success('Custom ID format saved successfully');
        this.saving = false;
      },
      error: (err) => {
        this.notification.showHttpError(err, 'Failed to save format');
        this.saving = false;
      }
    });
  }

  resetFormat(): void {
    if (!confirm('Are you sure you want to reset to default format?')) {
      return;
    }

    this.components = [
      { type: 'TEXT', value: 'ITEM' },
      { type: 'TEXT', value: '-' },
      { type: 'SEQUENCE' }
    ];
    this.updatePreview();
  }

  getComponentIcon(type: string): string {
    switch (type) {
      case 'TEXT': return 'fa-font';
      case 'RANDOM': return 'fa-random';
      case 'GUID': return 'fa-fingerprint';
      case 'DATE': return 'fa-calendar';
      case 'SEQUENCE': return 'fa-sort-numeric-up';
      default: return 'fa-question';
    }
  }

  getComponentColor(type: string): string {
    switch (type) {
      case 'TEXT': return 'primary';
      case 'RANDOM': return 'success';
      case 'GUID': return 'info';
      case 'DATE': return 'warning';
      case 'SEQUENCE': return 'danger';
      default: return 'secondary';
    }
  }
}
