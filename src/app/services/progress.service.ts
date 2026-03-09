import { Injectable } from '@angular/core';
import { MetricData, ProcessingItem, ProcessingSummary } from '../models/metric-data.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private itemsSubject = new BehaviorSubject<ProcessingItem[]>([]);
  private summarySubject = new BehaviorSubject<ProcessingSummary>({
    total: 0,
    success: 0,
    failed: 0,
    pending: 0,
    processing: 0
  });

  items$: Observable<ProcessingItem[]> = this.itemsSubject.asObservable();
  summary$: Observable<ProcessingSummary> = this.summarySubject.asObservable();

  initializeItems(data: MetricData[]): void {
    const items: ProcessingItem[] = data.map((item, index) => ({
      id: index,
      data: item,
      status: 'pending' as const,
      retryCount: 0
    }));

    this.itemsSubject.next(items);
    this.updateSummary();
  }

  updateItemStatus(id: number, status: ProcessingItem['status'], error?: string): void {
    const items = this.itemsSubject.getValue();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
      items[itemIndex] = {
        ...items[itemIndex],
        status,
        error: error || items[itemIndex].error
      };
      
      if (status === 'failed') {
        items[itemIndex].retryCount++;
      }

      this.itemsSubject.next([...items]);
      this.updateSummary();
    }
  }

  resetFailedItems(): void {
    const items = this.itemsSubject.getValue();
    const updatedItems = items.map(item => {
      if (item.status === 'failed') {
        return { ...item, status: 'pending' as const };
      }
      return item;
    });
    
    this.itemsSubject.next(updatedItems);
    this.updateSummary();
  }

  resetProcessingItems(): void {
    const items = this.itemsSubject.getValue();
    const updatedItems = items.map(item => {
      if (item.status === 'processing') {
        return { ...item, status: 'pending' as const };
      }
      return item;
    });
    
    this.itemsSubject.next(updatedItems);
    this.updateSummary();
  }

  getRetryableItems(maxRetries: number): ProcessingItem[] {
    return this.itemsSubject.getValue().filter(
      item => item.status === 'failed' && item.retryCount < maxRetries
    );
  }

  resetRetryableItems(maxRetries: number): void {
    const items = this.itemsSubject.getValue();
    const updatedItems = items.map(item => {
      if (item.status === 'failed' && item.retryCount < maxRetries) {
        return { ...item, status: 'pending' as const };
      }
      return item;
    });
    
    this.itemsSubject.next(updatedItems);
    this.updateSummary();
  }

  getExhaustedFailedItems(maxRetries: number): ProcessingItem[] {
    return this.itemsSubject.getValue().filter(
      item => item.status === 'failed' && item.retryCount >= maxRetries
    );
  }

  getFailedItems(): ProcessingItem[] {
    return this.itemsSubject.getValue().filter(item => item.status === 'failed');
  }

  getPendingItems(): ProcessingItem[] {
    return this.itemsSubject.getValue().filter(item => item.status === 'pending');
  }

  getAllItems(): ProcessingItem[] {
    return this.itemsSubject.getValue();
  }

  private updateSummary(): void {
    const items = this.itemsSubject.getValue();
    const summary: ProcessingSummary = {
      total: items.length,
      success: items.filter(i => i.status === 'success').length,
      failed: items.filter(i => i.status === 'failed').length,
      pending: items.filter(i => i.status === 'pending').length,
      processing: items.filter(i => i.status === 'processing').length
    };
    
    this.summarySubject.next(summary);
  }

  reset(): void {
    this.itemsSubject.next([]);
    this.summarySubject.next({
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
      processing: 0
    });
  }

  getSummary(): ProcessingSummary {
    return this.summarySubject.getValue();
  }
}
