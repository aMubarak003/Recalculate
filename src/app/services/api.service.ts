import { Injectable } from '@angular/core';
import { EmailPayload, MetricData } from '../models/metric-data.model';
import { Observable, retry, timeout } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private domainUrl: string = '';

  constructor(private http: HttpClient) {}

  setDomainUrl(url: string): void {
    // Remove trailing slash if present
    this.domainUrl = url.replace(/\/$/, '');
  }

  getDomainUrl(): string {
    return this.domainUrl;
  }

  updateMetricSnapshot(metricData: MetricData): Observable<any> {
    const url = `${this.domainUrl}/Metric/update/EditmetricSnapshotvaluesForRecalc?nodeId=${metricData.ScorecardNodeId}&CalId=${metricData.CalendarPeriodId}`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put(url, [metricData], { headers }).pipe(
      timeout(30000) // 30 second timeout
    );
  }

  sendEmail(payload: EmailPayload): Observable<any> {
    const url = `${this.domainUrl}/api/email/send`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(url, payload, { headers }).pipe(
      timeout(30000),
      retry(2)
    );
  }
}
