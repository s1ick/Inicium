import { Component, input, output, model, booleanAttribute, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent {
  // ===== INPUT SIGNALS =====
  readonly label = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly indeterminate = input(false, { transform: booleanAttribute });

  // ===== TWO-WAY BINDING WITH MODEL =====
  readonly checked = model(false);

  // ===== OUTPUT SIGNALS =====
  readonly checkedChange = output<boolean>();

  // ===== COMPUTED PROPERTIES =====
  readonly checkboxClass = computed(() => {
    const isChecked = this.checked();
    const isIndeterminate = this.indeterminate();
    const isDisabled = this.disabled();

    return `custom-checkbox ${isChecked ? 'checked' : ''} ${isIndeterminate ? 'indeterminate' : ''} ${isDisabled ? 'disabled' : ''}`.trim();
  });

  readonly wrapperClass = computed(() =>
    `checkbox-wrapper ${this.disabled() ? 'disabled' : ''}`.trim()
  );

  readonly isInteractive = computed(() => !this.disabled());

  // ===== EVENT HANDLERS =====
  readonly toggle = (event: Event): void => {
    event.stopPropagation();

    if (!this.isInteractive()) return;

    // Если indeterminate, сначала сбрасываем в false
    if (this.indeterminate()) {
      this.checked.set(false);
    } else {
      this.checked.set(!this.checked());
    }

    this.checkedChange.emit(this.checked());
  };

  readonly onKeydown = (event: KeyboardEvent): void => {
    if ((event.key === 'Enter' || event.key === ' ') && this.isInteractive()) {
      event.preventDefault();
      this.toggle(event);
    }
  };
}
