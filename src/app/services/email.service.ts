import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ProgressService } from './progress.service';
import { Observable } from 'rxjs';
import { EmailPayload } from '../models/metric-data.model';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(
    private apiService: ApiService,
    private progressService: ProgressService,
  ) {}

  sendCompletionEmail(emailAddresses: string[]): Observable<any> {
    const summary = this.progressService.getSummary();

    const payload: EmailPayload = {
      to: emailAddresses,
      subject: 'Metric Recalculation Complete',
      body: this.generateEmailBody(summary),
    };

    return this.apiService.sendEmail(payload);
  }

  private generateEmailBody(summary: { total: number; success: number; failed: number }): string {
    const timestamp = new Date().toLocaleString();
    const successRate =
      summary.total > 0 ? ((summary.success / summary.total) * 100).toFixed(2) : '0.00';

    return `
Metric Recalculation Processing Complete
=========================================

Timestamp: ${timestamp}

Processing Summary:
-------------------
• Total Items Processed: ${summary.total}
• Successful: ${summary.success}
• Failed: ${summary.failed}
• Success Rate: ${successRate}%

${summary.failed > 0 ? '\n⚠️ Some items failed to process. Please review the failed items in the application.\n' : '\n✅ All items processed successfully!\n'}

This is an automated notification from the Metric Recalculation Application.
    `.trim();
  }
}
