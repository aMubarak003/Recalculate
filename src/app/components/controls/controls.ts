import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QueueStatus } from '../../services/queue.service';

@Component({
  selector: 'app-controls',
  imports: [CommonModule, FormsModule],
  templateUrl: './controls.html',
  styleUrls: ['./controls.scss'],
})
export class Controls {
@Input() status: QueueStatus = 'idle';
  @Input() isConfigured = false;
  @Input() hasData = false;
  @Input() concurrency = 12;

  @Output() start = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() resume = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() concurrencyChange = new EventEmitter<number>();

  onConcurrencyChange(value: number): void {
    this.concurrencyChange.emit(value);
  }

  get canStart(): boolean {
    return this.isConfigured && this.hasData && 
           (this.status === 'idle' || this.status === 'completed');
  }

  get canPause(): boolean {
    return this.status === 'running' || this.status === 'retrying';
  }

  get canResume(): boolean {
    return this.status === 'paused';
  }

  get canStop(): boolean {
    return this.status === 'running' || this.status === 'paused' || this.status === 'retrying';
  }

  get canReset(): boolean {
    return this.status !== 'running' && this.status !== 'retrying';
  }
}
