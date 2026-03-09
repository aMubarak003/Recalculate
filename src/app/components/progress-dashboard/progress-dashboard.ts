import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcessingItem, ProcessingSummary } from '../../models/metric-data.model';
import { ProgressService } from '../../services/progress.service';
import { QueueStatus, QueueService } from '../../services/queue.service';

@Component({
  selector: 'app-progress-dashboard',
  imports: [CommonModule],
  templateUrl: './progress-dashboard.html',
  styleUrls: ['./progress-dashboard.scss'],
})
export class ProgressDashboard {
items: ProcessingItem[] = [];
  summary: ProcessingSummary = {
    total: 0,
    success: 0,
    failed: 0,
    pending: 0,
    processing: 0
  };
  status: QueueStatus = 'idle';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private progressService: ProgressService,
    private queueService: QueueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.progressService.items$.subscribe(items => {
        this.items = [...items];
        this.cdr.detectChanges();
      }),
      this.progressService.summary$.subscribe(summary => {
        this.summary = { ...summary };
        this.cdr.detectChanges();
      }),
      this.queueService.status$.subscribe(status => {
        this.status = status;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get progressPercentage(): number {
    if (this.summary.total === 0) return 0;
    return ((this.summary.success + this.summary.failed) / this.summary.total) * 100;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  }

  trackByItem(index: number, item: ProcessingItem): string {
    return `${item.id}-${item.status}-${item.retryCount}`;
  }
}
