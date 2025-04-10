import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CheckboxComponent),
    multi: true
  }]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() indeterminate: boolean = false; // Добавляем input для indeterminate
  
  private _checked: boolean = false;
  
  @Input()
  get checked(): boolean {
    return this._checked;
  }
  
  set checked(value: boolean) {
    if (this._checked !== value) {
      this._checked = value;
      this.onChange(this._checked);
      this.onTouched();
    }
  }
  
  @Output() checkedChange = new EventEmitter<boolean>();

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(event: Event) {
    event.stopPropagation();
    if (this.disabled) return;
    
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}