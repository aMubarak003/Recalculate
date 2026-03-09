import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigForm } from './config-form';

describe('ConfigForm', () => {
  let component: ConfigForm;
  let fixture: ComponentFixture<ConfigForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
