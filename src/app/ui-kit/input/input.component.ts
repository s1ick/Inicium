import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() minLength?: number;
  @Input() validationType: 'text' | 'email' | 'phone' | 'none' = 'none';

  control: FormControl = new FormControl('');
  private onChange: (value: any) => void = () => {};
  public onTouched: () => void = () => {};

  ngOnInit(): void {
    this.control.setValidators(this.getValidators());
    this.control.updateValueAndValidity();
  }

  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.control.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  private getValidators() {
    const validators = [];
    
    if (this.required) {
      validators.push(Validators.required);
    }

    if (this.minLength) {
      validators.push(Validators.minLength(this.minLength));
    }

    switch (this.validationType) {
      case 'text':
        validators.push(this.noNumbersValidator);
        break;
      case 'email':
        validators.push(Validators.email);
        break;
      case 'phone':
        validators.push(this.phoneValidator);
        break;
    }

    return validators;
  }

  //+7XXXXXXXXXX
 // 8XXXXXXXXXX
  //7XXXXXXXXXX
  
  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const phoneRegex = /^(\+7|8|7)[\d\- ]{10,15}$/;
    const digitsOnly = control.value.replace(/\D/g, '');
    
    // Проверяем что после очистки осталось 11 цифр
    return phoneRegex.test(control.value) && digitsOnly.length === 11 
      ? null 
      : { invalidPhone: true };
  }
  private noNumbersValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return /\d/.test(control.value) ? { hasNumbers: true } : null;
  }

  get errorMessage(): string | null {
    if (!this.control.touched || !this.control.errors) {
      return null;
    }

    const errors = this.control.errors;

    if (errors['required']) {
      return 'Обязательное поле';
    }

    if (errors['minlength']) {
      return `Минимум ${errors['minlength'].requiredLength} символа`;
    }

    if (errors['email']) {
      return 'Неверный формат email';
    }

    if (errors['invalidPhone']) {
      return 'Введите телефон в формате +79991234567 или 89991234567';
    }

    if (errors['hasNumbers']) {
      return 'Нельзя использовать цифры в этом поле';
    }

    return null;
  }
}