import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from '../../models/metric-data.model';

@Component({
  selector: 'app-config-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './config-form.html',
  styleUrls: ['./config-form.scss'],
})
export class ConfigForm {
  @Output() configSubmit = new EventEmitter<AppConfig>();

  configForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.configForm = this.fb.group({
      domainUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  onSubmit(): void {
    if (this.configForm.valid) {
      const config: AppConfig = {
        domainUrl: this.configForm.value.domainUrl,
      };
      this.configSubmit.emit(config);
    }
  }

  get domainUrl() {
    return this.configForm.get('domainUrl');
  }
}
