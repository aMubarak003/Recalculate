import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild } from '@angular/core';
import { AppConfig, MetricData } from './models/metric-data.model';
import { ApiService } from './services/api.service';
import { FileReaderService } from './services/file-reader.service';
import { ProgressService } from './services/progress.service';
import { QueueStatus, QueueService } from './services/queue.service';
import { ConfigForm } from './components/config-form/config-form';
import { Controls } from './components/controls/controls';
import { ProgressDashboard } from './components/progress-dashboard/progress-dashboard';
import { FileUpload } from './components/file-upload/file-upload';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ConfigForm,
    FileUpload,
    ProgressDashboard,
    Controls
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  @ViewChild(FileUpload) fileUploadComponent!: FileUpload;

  config: AppConfig | null = null;
  metricData: MetricData[] = [];
  status: QueueStatus = 'idle';
  concurrency = 12;
  isProcessingComplete = false;
  private audioContext: AudioContext | null = null;

  constructor(
    private fileReaderService: FileReaderService,
    private apiService: ApiService,
    private queueService: QueueService,
    private progressService: ProgressService
  ) {
    this.queueService.status$.subscribe(status => {
      this.status = status;
      
      // When processing completes, play warning sound
      if (status === 'completed' && !this.isProcessingComplete && this.config) {
        this.isProcessingComplete = true;
        this.playWarningSound();
      }
    });
  }

  onConfigSubmit(config: AppConfig): void {
    this.config = config;
    this.apiService.setDomainUrl(config.domainUrl);
  }

  async onFilesSelected(files: FileList): Promise<void> {
    try {
      this.metricData = await this.fileReaderService.readFiles(files);
      this.progressService.initializeItems(this.metricData);
      this.isProcessingComplete = false;
    } catch (error: any) {
      console.error('Error reading files:', error);
      alert(`Error reading files: ${error.message}`);
    }
  }

  onStart(): void {
    this.isProcessingComplete = false;
    this.queueService.startProcessing();
  }

  onPause(): void {
    this.queueService.pause();
  }

  onResume(): void {
    this.queueService.resume();
  }

  onStop(): void {
    this.queueService.stop();
  }

  onReset(): void {
    this.queueService.reset();
    this.metricData = [];
    this.isProcessingComplete = false;
    if (this.fileUploadComponent) {
      this.fileUploadComponent.clearFiles();
    }
  }

  onConcurrencyChange(value: number): void {
    this.concurrency = value;
    this.queueService.setConcurrency(value);
  }

  private playWarningSound(): void {
    try {
      this.audioContext = new AudioContext();
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = 500; // Warning tone frequency
      oscillator.type = 'square';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      
      // Stop after 3 seconds
      setTimeout(() => {
        oscillator.stop();
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to play warning sound:', error);
    }
  }

  get isConfigured(): boolean {
    return this.config !== null;
  }

  get hasData(): boolean {
    return this.metricData.length > 0;
  }
}
