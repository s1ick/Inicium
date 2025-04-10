import { Component, input, model, output, computed, OnInit, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl, Validators, AbstractControl, ValidationErrors, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export type InputType = 'text' | 'email' | 'tel' | 'password' | 'number';
export type ValidationType = 'text' | 'email' | 'phone' | 'none';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor, OnInit, OnChanges {
  // ===== INPUT SIGNALS =====
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<InputType>('text');
  readonly required = input(false);
  readonly minLength = input<number>();
  readonly validationType = input<ValidationType>('none');

  // ===== TWO-WAY BINDING WITH MODEL =====
  readonly value = model('');

  // ===== OUTPUT SIGNALS =====
  readonly valueChange = output<string>();
  readonly touched = output<void>();
  readonly blurred = output<void>();

  // ===== FORM CONTROL =====
  readonly control = new FormControl('');

  // ===== CONTROL VALUE ACCESSOR =====
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // ===== COMPUTED PROPERTIES =====
  readonly errorMessage = computed(() => {
    const errors = this.control.errors;
    const isTouched = this.control.touched;

    if (!isTouched || !errors) {
      return null;
    }

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
      return 'Введите телефон в формате +79991234567';
    }

    if (errors['hasNumbers']) {
      return 'Нельзя использовать цифры в этом поле';
    }

    return null;
  });

  readonly hasError = computed(() =>
    this.control.touched && this.control.invalid
  );

  readonly isRequired = computed(() =>
    this.required() || this.control.hasValidator(Validators.required)
  );

  // ===== LIFECYCLE =====
  ngOnInit(): void {
    this.setupControl();
    this.setupValueChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['required'] || changes['minLength'] || changes['validationType']) {
      this.updateValidators();
    }
  }

  // ===== CONTROL VALUE ACCESSOR METHODS =====
  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
    this.value.set(value || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  // ===== EVENT HANDLERS =====
  readonly onInput = (event: Event): void => {
    const value = (event.target as HTMLInputElement).value;
    this.control.setValue(value);
    this.value.set(value);
    this.valueChange.emit(value);
    this.onChange(value);
  };

  readonly onBlur = (): void => {
    this.control.markAsTouched();
    this.onTouched();
    this.touched.emit();
    this.blurred.emit();
  };

  readonly onFocus = (): void => {
    this.control.markAsTouched();
  };

  // ===== PRIVATE METHODS =====
  private setupControl(): void {
    this.updateValidators();
  }

  private setupValueChanges(): void {
    this.control.valueChanges.subscribe(value => {
      if (value !== this.value()) {
        this.value.set(value ?? '');
        this.valueChange.emit(value ?? '');
        this.onChange(value ?? '');
      }
    });
  }

  private updateValidators(): void {
    const validators = [];

    if (this.required()) {
      validators.push(Validators.required);
    }

    if (this.minLength()) {
      validators.push(Validators.minLength(this.minLength()!));
    }

    switch (this.validationType()) {
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

    this.control.setValidators(validators);
    this.control.updateValueAndValidity();
  }

  // ===== VALIDATORS =====
  private readonly phoneValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const phoneRegex = /^(\+7|8|7)[\d\- ]{10,15}$/;
    const digitsOnly = control.value.replace(/\D/g, '');

    return phoneRegex.test(control.value) && digitsOnly.length === 11
      ? null
      : { invalidPhone: true };
  };

  private readonly noNumbersValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return /\d/.test(control.value) ? { hasNumbers: true } : null;
  };
}
