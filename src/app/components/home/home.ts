import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService, Inventory } from '../../services/inventory.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  latestInventories: Inventory[] = [];
  popularInventories: Inventory[] = [];
  loading = true;

  constructor(
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loading = true;
      this.cdr.detectChanges();
      
      this.inventoryService.getLatestInventories(10).subscribe({
        next: (data) => {
          this.latestInventories = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading latest inventories', err)
      });
      
      this.inventoryService.getPopularInventories(5).subscribe({
        next: (data) => {
          this.popularInventories = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading popular inventories', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }, 0);
  }
}
