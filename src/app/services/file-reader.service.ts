import { Injectable } from '@angular/core';
import { MetricData } from '../models/metric-data.model';

@Injectable({
  providedIn: 'root',
})
export class FileReaderService {
  async readFiles(files: FileList): Promise<MetricData[]> {
    const allData: MetricData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await this.readFileContent(file);
      const parsedData = this.parseContent(content, file.name);
      allData.push(...parsedData);
    }

    return allData;
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsText(file);
    });
  }

  private parseContent(content: string, fileName: string): MetricData[] {
    try {
      // Try parsing as JSON
      const parsed = JSON.parse(content);
      
      if (Array.isArray(parsed)) {
        return parsed.map(item => this.validateMetricData(item));
      } else if (typeof parsed === 'object') {
        return [this.validateMetricData(parsed)];
      }
      
      throw new Error('Invalid JSON structure');
    } catch (jsonError) {
      // Try parsing as text (one JSON object per line)
      return this.parseTextContent(content);
    }
  }

  private parseTextContent(content: string): MetricData[] {
    const lines = content.split('\n').filter(line => line.trim());
    const data: MetricData[] = [];

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line.trim());
        data.push(this.validateMetricData(parsed));
      } catch {
        // Skip invalid lines
        console.warn('Skipping invalid line:', line);
      }
    }

    return data;
  }

  private validateMetricData(item: any): MetricData {
    if (typeof item.ScorecardNodeId !== 'number' || typeof item.CalendarPeriodId !== 'number') {
      throw new Error('Invalid metric data: ScorecardNodeId and CalendarPeriodId must be numbers');
    }
    return item as MetricData;
  }
}
