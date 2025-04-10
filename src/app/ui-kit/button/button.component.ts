import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonIconComponent } from './button-icon.component';

export type ButtonType = 'primary' | 'secondary' | 'icon' | 'fab';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonIcon = 'add' | 'delete' | 'refresh' | string;

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ButtonIconComponent
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  // ===== INPUT SIGNALS =====
  readonly disabled = input(false);
  readonly type = input<ButtonType>('primary');
  readonly icon = input<ButtonIcon | undefined>();
  readonly size = input<ButtonSize>('medium');
  readonly loading = input(false);
  readonly ariaLabel = input<string | undefined>();

  // ===== OUTPUT SIGNALS =====
  readonly clicked = output<void>();
  readonly pressed = output<boolean>();

  // ===== COMPUTED PROPERTIES =====
  readonly buttonClass = computed(() => {
    const type = this.type();
    const size = this.size();
    const isLoading = this.loading();
    const iconType = this.icon();

    return `custom-button ${type} ${size} ${isLoading ? 'loading' : ''} ${iconType ? `icon-${iconType}` : ''}`.trim();
  });

  readonly isFab = computed(() => this.type() === 'fab');
  readonly isIcon = computed(() => this.type() === 'icon');
  readonly hasIcon = computed(() => !!this.icon());
  readonly isInteractive = computed(() => !this.disabled() && !this.loading());

  readonly computedAriaLabel = computed(() => {
    return this.ariaLabel() || this.getDefaultAriaLabel();
  });

  // ===== EVENT HANDLERS =====
  readonly onClick = (event: Event) => {
    event.stopPropagation();

    if (this.isInteractive()) {
      this.clicked.emit();
    }
  };

  readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onClick(event);
    }
  };

  // ===== PRIVATE METHODS =====
  private getDefaultAriaLabel(): string {
    const type = this.type();
    const icon = this.icon();

    if (icon) {
      switch (icon) {
        case 'add': return 'Добавить';
        case 'delete': return 'Удалить';
        case 'refresh': return 'Обновить';
      }
    }

    switch (type) {
      case 'fab': return 'Кнопка действий';
      case 'icon': return 'Иконка кнопки';
      case 'primary': return 'Основная кнопка';
      case 'secondary': return 'Вторичная кнопка';
      default: return 'Кнопка';
    }
  }
}
