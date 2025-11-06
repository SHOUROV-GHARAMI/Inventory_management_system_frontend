import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InventoryService, Inventory } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { DiscussionComponent } from '../discussion/discussion';
import { ItemsTableComponent } from '../items-table/items-table';
import { CustomFieldsEditorComponent } from '../custom-fields-editor/custom-fields-editor';
import { StatisticsComponent } from '../statistics/statistics';
import { AccessSharingComponent } from '../access-sharing/access-sharing';
import { CustomIdConfigComponent } from '../custom-id-config/custom-id-config';

@Component({
  selector: 'app-inventory-detail',
  imports: [CommonModule, RouterModule, DiscussionComponent, ItemsTableComponent, CustomFieldsEditorComponent, StatisticsComponent, AccessSharingComponent, CustomIdConfigComponent],
  templateUrl: './inventory-detail.html',
  styleUrl: './inventory-detail.scss',
})
export class InventoryDetailComponent implements OnInit, OnDestroy {
  inventory: Inventory | null = null;
  loading = true;
  error = '';
  activeTab = 'items';
  isOwner = false;
  canEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInventory(+id);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadInventory(id: number): void {
    this.loading = true;
    this.error = '';

    this.inventoryService.getInventory(id).subscribe({
      next: (data) => {
        this.inventory = data;
        this.loading = false;
        this.checkPermissions();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load inventory.';
        this.loading = false;
      }
    });
  }

  checkPermissions(): void {
    if (!this.inventory) return;
    
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.isOwner = this.inventory.ownerId === currentUser.id;
    this.canEdit = this.isOwner || currentUser.isAdmin;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  deleteInventory(): void {
    if (!this.inventory || !confirm('Are you sure you want to delete this inventory?')) return;

    this.inventoryService.deleteInventory(this.inventory.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete inventory.';
      }
    });
  }
}
