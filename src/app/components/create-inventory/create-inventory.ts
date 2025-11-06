import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { InventoryService, CreateInventoryDto } from '../../services/inventory.service';

@Component({
  selector: 'app-create-inventory',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-inventory.html',
  styleUrl: './create-inventory.scss',
})
export class CreateInventoryComponent implements OnInit {
  inventory: CreateInventoryDto = {
    title: '',
    description: '',
    category: '',
    tags: '',
    isPublic: true
  };

  loading = false;
  error = '';
  editMode = false;
  inventoryId: number | null = null;

  // Common categories for dropdown
  categories = [
    'Electronics',
    'Books',
    'Collectibles',
    'Art',
    'Music',
    'Games',
    'Tools',
    'Sports',
    'Fashion',
    'Other'
  ];

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.inventoryId = +id;
      this.loadInventory(this.inventoryId);
    }
  }

  loadInventory(id: number): void {
    this.loading = true;
    this.inventoryService.getInventory(id).subscribe({
      next: (data) => {
        this.inventory = {
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags,
          isPublic: data.isPublic,
          imageUrl: data.imageUrl
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load inventory.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.editMode && this.inventoryId) {
      // Update existing inventory
      this.inventoryService.updateInventory(this.inventoryId, this.inventory).subscribe({
        next: () => {
          this.router.navigate(['/inventories', this.inventoryId]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update inventory.';
          this.loading = false;
        }
      });
    } else {
      // Create new inventory
      this.inventoryService.createInventory(this.inventory).subscribe({
        next: (created) => {
          this.router.navigate(['/inventories', created.id]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create inventory.';
          this.loading = false;
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.inventory.title.trim()) {
      this.error = 'Title is required.';
      return false;
    }
    if (this.inventory.title.length > 100) {
      this.error = 'Title must be 100 characters or less.';
      return false;
    }
    if (!this.inventory.category.trim()) {
      this.error = 'Category is required.';
      return false;
    }
    if (!this.inventory.description.trim()) {
      this.error = 'Description is required.';
      return false;
    }
    return true;
  }

  cancel(): void {
    if (this.editMode && this.inventoryId) {
      this.router.navigate(['/inventories', this.inventoryId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
