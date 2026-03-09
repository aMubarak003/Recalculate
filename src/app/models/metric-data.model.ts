export interface MetricData {
  ScorecardNodeId: number;
  CalendarPeriodId: number;
  [key: string]: any;
}

export interface ProcessingItem {
  id: number;
  data: MetricData;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
  retryCount: number;
}

export interface ProcessingSummary {
  total: number;
  success: number;
  failed: number;
  pending: number;
  processing: number;
}

export interface EmailPayload {
  to: string[];
  subject: string;
  body: string;
}

export interface AppConfig {
  domainUrl: string;
  emailAddresses: string[];
}