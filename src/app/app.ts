import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild } from '@angular/core';
import { AppConfig, MetricData } from './models/metric-data.model';
import { ApiService } from './services/api.service';
import { EmailService } from './services/email.service';
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
  emailSent = false;
  emailError: string | null = null;

  constructor(
    private fileReaderService: FileReaderService,
    private apiService: ApiService,
    private queueService: QueueService,
    private progressService: ProgressService,
    private emailService: EmailService
  ) {
    this.queueService.status$.subscribe(status => {
      this.status = status;
      
      // When processing completes, send email
      if (status === 'completed' && !this.isProcessingComplete && this.config) {
        this.isProcessingComplete = true;
        this.sendCompletionEmail();
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
      this.emailSent = false;
      this.emailError = null;
    } catch (error: any) {
      console.error('Error reading files:', error);
      alert(`Error reading files: ${error.message}`);
    }
  }

  onStart(): void {
    this.isProcessingComplete = false;
    this.emailSent = false;
    this.emailError = null;
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
    this.emailSent = false;
    this.emailError = null;
    if (this.fileUploadComponent) {
      this.fileUploadComponent.clearFiles();
    }
  }

  onConcurrencyChange(value: number): void {
    this.concurrency = value;
    this.queueService.setConcurrency(value);
  }

  private sendCompletionEmail(): void {
    if (!this.config) return;

    this.emailService.sendCompletionEmail(this.config.emailAddresses).subscribe({
      next: () => {
        this.emailSent = true;
        console.log('Completion email sent successfully');
      },
      error: (error) => {
        this.emailError = error.message || 'Failed to send email';
        console.error('Failed to send completion email:', error);
      }
    });
  }

  get isConfigured(): boolean {
    return this.config !== null;
  }

  get hasData(): boolean {
    return this.metricData.length > 0;
  }
}
