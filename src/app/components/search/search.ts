import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

interface SearchResult {
  inventories: InventoryResult[];
  items: ItemResult[];
  totalCount: number;
}

interface InventoryResult {
  id: number;
  title: string;
  description: string;
  category: string;
  ownerUsername: string;
  itemCount: number;
  isPublic: boolean;
}

interface ItemResult {
  id: number;
  name: string;
  customId: string;
  inventoryId: number;
  inventoryTitle: string;
}

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent {
  query = '';
  searchType: 'all' | 'inventories' | 'items' = 'all';
  results: SearchResult = { inventories: [], items: [], totalCount: 0 };
  searching = false;
  searched = false;

  constructor(
    private api: ApiService,
    private notification: NotificationService,
    private router: Router
  ) {}

  search(): void {
    if (!this.query || this.query.length < 2) {
      this.notification.warning('Please enter at least 2 characters to search');
      return;
    }

    this.searching = true;
    this.searched = false;

    const endpoint = this.getSearchEndpoint();

    this.api.get<any>(endpoint).subscribe({
      next: (data) => {
        if (this.searchType === 'all') {
          this.results = {
            inventories: data.inventories || [],
            items: data.items || [],
            totalCount: (data.inventories?.length || 0) + (data.items?.length || 0)
          };
        } else if (this.searchType === 'inventories') {
          this.results = {
            inventories: data || [],
            items: [],
            totalCount: data?.length || 0
          };
        } else {
          this.results = {
            inventories: [],
            items: data || [],
            totalCount: data?.length || 0
          };
        }
        this.searching = false;
        this.searched = true;
      },
      error: (err) => {
        this.notification.showHttpError(err, 'Search failed');
        this.searching = false;
        this.searched = true;
      }
    });
  }

  private getSearchEndpoint(): string {
    const encodedQuery = encodeURIComponent(this.query);
    switch (this.searchType) {
      case 'inventories':
        return `search/inventories?q=${encodedQuery}`;
      case 'items':
        return `search/items?q=${encodedQuery}`;
      default:
        return `search?q=${encodedQuery}`;
    }
  }

  clearSearch(): void {
    this.query = '';
    this.results = { inventories: [], items: [], totalCount: 0 };
    this.searched = false;
  }

  navigateToInventory(id: number): void {
    this.router.navigate(['/inventories', id]);
  }

  navigateToItem(inventoryId: number): void {
    this.router.navigate(['/inventories', inventoryId]);
  }

  getHighlightedText(text: string): string {
    if (!this.query) return text;
    const regex = new RegExp(`(${this.query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}
