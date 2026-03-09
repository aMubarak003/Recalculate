import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, mergeMap, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { ProcessingItem } from '../models/metric-data.model';
import { ApiService } from './api.service';
import { ProgressService } from './progress.service';

export type QueueStatus = 'idle' | 'running' | 'paused' | 'completed' | 'retrying';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  private stopSignal$ = new Subject<void>();
  private pauseSignal$ = new Subject<void>();
  private statusSubject = new BehaviorSubject<QueueStatus>('idle');
  private concurrency = 12; // Default: 12 concurrent requests (between 10-15)
  private isPaused = false;
  private pendingItems: ProcessingItem[] = [];
  private currentIndex = 0;

  status$: Observable<QueueStatus> = this.statusSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private progressService: ProgressService
  ) {}

  setConcurrency(value: number): void {
    this.concurrency = Math.min(Math.max(value, 1), 20); // Clamp between 1 and 20
  }

  getConcurrency(): number {
    return this.concurrency;
  }

  async startProcessing(): Promise<void> {
    if (this.statusSubject.getValue() === 'running') {
      return;
    }

    this.isPaused = false;
    this.statusSubject.next('running');
    
    const pendingItems = this.progressService.getPendingItems();
    
    if (pendingItems.length === 0) {
      this.statusSubject.next('completed');
      return;
    }

    await this.processItems(pendingItems);
    
    // After initial processing, check for failed items and retry
    const failedItems = this.progressService.getFailedItems();
    
    if (failedItems.length > 0 && !this.isPaused && this.statusSubject.getValue() === 'running') {
      this.statusSubject.next('retrying');
      this.progressService.resetFailedItems();
      const itemsToRetry = this.progressService.getPendingItems();
      await this.processItems(itemsToRetry);
    }

    if (this.statusSubject.getValue() !== 'paused') {
      this.statusSubject.next('completed');
    }
  }

  private processItems(items: ProcessingItem[]): Promise<void> {
    return new Promise((resolve) => {
      let completed = 0;
      const total = items.length;

      from(items).pipe(
        takeUntil(this.stopSignal$),
        mergeMap(item => this.processItem(item), this.concurrency),
      ).subscribe({
        next: () => {
          completed++;
        },
        error: (err) => {
          console.error('Queue error:', err);
          resolve();
        },
        complete: () => {
          resolve();
        }
      });
    });
  }

  private processItem(item: ProcessingItem): Observable<any> {
    // If paused or stopped, skip this item (it will remain pending)
    if (this.isPaused) {
      return of(null);
    }

    // Update status to processing
    this.progressService.updateItemStatus(item.id, 'processing');

    return this.apiService.updateMetricSnapshot(item.data).pipe(
      takeUntil(this.stopSignal$),
      tap(() => {
        this.progressService.updateItemStatus(item.id, 'success');
      }),
      catchError((error) => {
        const errorMessage = error?.message || error?.statusText || 'Unknown error';
        this.progressService.updateItemStatus(item.id, 'failed', errorMessage);
        return of(null); // Continue processing other items
      })
    );
  }

  pause(): void {
    this.isPaused = true;
    this.stopSignal$.next();
    this.progressService.resetProcessingItems();
    this.statusSubject.next('paused');
  }

  resume(): void {
    if (this.statusSubject.getValue() === 'paused') {
      this.startProcessing();
    }
  }

  stop(): void {
    this.isPaused = true;
    this.stopSignal$.next();
    this.progressService.resetProcessingItems();
    this.statusSubject.next('idle');
  }

  reset(): void {
    this.stop();
    this.progressService.reset();
    this.statusSubject.next('idle');
  }

  getStatus(): QueueStatus {
    return this.statusSubject.getValue();
  }
}
