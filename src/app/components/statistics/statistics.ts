import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

interface InventoryStatistics {
  totalItems: number;
  totalLikes: number;
  totalComments: number;
  viewCount: number;
  fieldStatistics: FieldStatistics[];
}

interface FieldStatistics {
  fieldId: number;
  fieldName: string;
  fieldType: string;
  average?: number;
  min?: number;
  max?: number;
  sum?: number;
  filledCount: number;
  emptyCount: number;
  topValues: ValueFrequency[];
}

interface ValueFrequency {
  value: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-statistics',
  imports: [CommonModule],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss'
})
export class StatisticsComponent implements OnInit, OnChanges {
  @Input() inventoryId!: number;
  
  statistics: InventoryStatistics | null = null;
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnChanges(): void {
    if (this.inventoryId) {
      this.loadStatistics();
    }
  }

  loadStatistics(): void {
    if (!this.inventoryId) return;

    this.loading = true;
    this.error = '';

    this.api.get<InventoryStatistics>(`inventories/${this.inventoryId}/statistics`).subscribe({
      next: (data) => {
        this.statistics = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load statistics';
        this.notification.showHttpError(err, 'Failed to load statistics');
        this.loading = false;
      }
    });
  }

  getFilledPercentage(stat: FieldStatistics): number {
    const total = stat.filledCount + stat.emptyCount;
    return total > 0 ? (stat.filledCount / total) * 100 : 0;
  }

  hasNumericStats(stat: FieldStatistics): boolean {
    return stat.average !== undefined && stat.average !== null;
  }

  hasTopValues(stat: FieldStatistics): boolean {
    return stat.topValues && stat.topValues.length > 0;
  }
}
