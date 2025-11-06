import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService, Inventory } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  myInventories: Inventory[] = [];
  sharedInventories: Inventory[] = [];
  loading = true;

  constructor(
    public authService: AuthService,
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInventories();
  }

  loadInventories(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loading = true;
      this.cdr.detectChanges();
      
      this.inventoryService.getMyInventories().subscribe({
        next: (data) => {
          this.myInventories = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading my inventories', err)
      });
      
      this.inventoryService.getSharedInventories().subscribe({
        next: (data) => {
          this.sharedInventories = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading shared inventories', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }, 0);
  }
}
