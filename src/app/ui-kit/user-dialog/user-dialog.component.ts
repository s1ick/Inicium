import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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

export interface UserFormData {
  name: string;
  surname: string;
  email: string;
  phone?: string;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ButtonComponent,
    InputComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss'
})
export class UserDialogComponent implements OnInit {
  // ===== DEPENDENCY INJECTION =====
  private readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  // ===== STATE WITH SIGNALS =====
  readonly mode = signal<DialogMode>(this.data.mode || 'add');
  readonly title = signal(this.getDialogTitle());
  readonly content = signal(this.getDialogContent());
  readonly confirmText = signal(this.getConfirmButtonText());
  readonly cancelText = signal(this.data.cancelText || 'Отмена');

  // ===== FORM MANAGEMENT =====
  userForm!: FormGroup;
  readonly isFormValid = signal(false);
  readonly showForm = computed(() =>
    this.mode() === 'add' || this.mode() === 'edit'
  );

  // ===== COMPUTED PROPERTIES =====
  readonly confirmDisabled = computed(() =>
    this.showForm() ? !this.isFormValid() : false
  );

  // ===== LIFECYCLE =====
  ngOnInit(): void {
    this.initializeForm();
    this.setupFormValidation();
  }

  // ===== FORM METHODS =====
  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    // Patch values for edit mode
    if (this.mode() === 'edit' && this.data.user) {
      this.userForm.patchValue({
        name: this.data.user.name || '',
        surname: this.data.user.surname || '',
        email: this.data.user.email || '',
        phone: this.data.user.phone || ''
      });
    }

    // Initial validation check
    this.isFormValid.set(this.userForm.valid);
  }

  private setupFormValidation(): void {
    if (this.showForm()) {
      this.userForm.statusChanges.subscribe(status => {
        this.isFormValid.set(status === 'VALID');
      });
    }
  }

  // ===== EVENT HANDLERS =====
  readonly onCancel = (): void => {
    this.dialogRef.close(null);
  };

  readonly onConfirm = (): void => {
    if (this.showForm()) {
      // Валидация формы для add/edit режимов
      if (this.userForm.invalid) {
        this.markAllAsTouched();
        return;
      }

      // Возвращаем данные формы
      this.dialogRef.close(this.userForm.value);
    } else {
      // Для delete режима возвращаем true
      this.dialogRef.close(true);
    }
  };

  // ===== PRIVATE METHODS =====
  private getDialogTitle(): string {
    switch (this.mode()) {
      case 'add': return this.data.title || 'Добавить пользователя';
      case 'edit': return this.data.title || 'Редактировать пользователя';
      case 'delete': return this.data.title || 'Удаление пользователей';
      default: return this.data.title || 'Подтверждение';
    }
  }

  private getDialogContent(): string {
    if (this.mode() === 'delete') {
      const count = this.data.count || 0;
      return this.data.content || `Вы уверены, что хотите удалить ${count} пользователей?`;
    }
    return this.data.content || '';
  }

  private getConfirmButtonText(): string {
    switch (this.mode()) {
      case 'delete': return this.data.confirmText || 'Удалить';
      default: return this.data.confirmText || 'Сохранить';
    }
  }

  private markAllAsTouched(): void {
    Object.values(this.userForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
