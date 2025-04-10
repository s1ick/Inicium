import { Component, Inject, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ButtonComponent } from 'src/app/ui-kit/button/button.component';
import { InputComponent } from 'src/app/ui-kit/input/input.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export type DialogMode = 'add' | 'edit' | 'delete';

export interface DialogData {
  mode: DialogMode;
  title?: string;
  content?: string;
  count?: number;
  user?: any;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ButtonComponent,
    MatButtonModule,
    InputComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit, AfterViewInit {
  mode: DialogMode = 'add';
  title: string = '';
  content: string = '';
  confirmText: string = '';
  cancelText: string = 'Отмена';
  userForm: FormGroup;
  isFormValid: boolean = false;
  showForm: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    // Явная инициализация формы
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.initializeDialog();
  }
  private initializeDialog(): void {
    this.mode = this.data.mode || 'add';
    this.title = this.getDialogTitle();
    this.content = this.getDialogContent();
    this.confirmText = this.getConfirmButtonText();
    this.cancelText = this.data.cancelText || 'Отмена';

    if (this.mode === 'edit' && this.data.user) {
      this.userForm.patchValue(this.data.user);
    }
  }
  ngOnInit(): void {
    this.setupFormValidation();
  }

  ngAfterViewInit(): void {
    this.showForm = this.shouldShowForm();
    this.cdRef.detectChanges();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    if (this.mode === 'edit' && this.data.user) {
      this.patchFormValues();
    }
  }

  private patchFormValues(): void {
    this.userForm.patchValue({
      name: this.data.user.name,
      surname: this.data.user.surname,
      email: this.data.user.email,
      phone: this.data.user.phone || ''
    });
  }

  private setupFormValidation(): void {
    if (this.shouldValidateForm()) {
      this.userForm.statusChanges.pipe(
        debounceTime(100),
        distinctUntilChanged()
      ).subscribe(status => {
        this.isFormValid = status === 'VALID';
        this.cdRef.markForCheck();
      });
    }
  }

  private shouldShowForm(): boolean {
    return this.mode === 'add' || this.mode === 'edit';
  }

  private getDialogTitle(): string {
    switch (this.mode) {
      case 'add': return this.data.title || 'Добавить пользователя';
      case 'edit': return this.data.title || 'Редактировать пользователя';
      case 'delete': return this.data.title || `Удаление строк`;
      default: return this.data.title || 'Подтверждение';
    }
  }

  private getDialogContent(): string {
    if (this.mode === 'delete') {
      return this.data.content || `Удалить выбранные строки (${this.data.count || 0})?`;
    }
    return this.data.content || '';
  }

  private getConfirmButtonText(): string {
    switch (this.mode) {
      case 'delete': return this.data.confirmText || 'Удалить';
      default: return this.data.confirmText || 'Сохранить';
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    if (this.shouldValidateForm() && this.userForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    const result = this.shouldValidateForm() 
      ? this.userForm.value 
      : true;
    
    this.dialogRef.close(result);
  }

  private shouldValidateForm(): boolean {
    return this.mode === 'add' || this.mode === 'edit';
  }

  private markAllAsTouched(): void {
    Object.values(this.userForm.controls).forEach((control: AbstractControl) => {
      control.markAsTouched();
    });
    this.cdRef.markForCheck();
  }

  get confirmDisabled(): boolean {
    return this.shouldValidateForm() ? !this.isFormValid : false;
  }
}