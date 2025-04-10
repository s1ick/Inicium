import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
export type ButtonIconType = 'add' | 'delete' | 'refresh' | string;

@Component({
  selector: 'app-button-icon',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @switch (icon()) {
      @case ('add') {
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" [attr.aria-label]="'Добавить'">
          <path d="M18 18L18 2L2 2L2 18L18 18ZM17.77 0C18.36 0 18.93 0.23 19.34 0.65C19.76 1.06 20 1.63 20 2.22L20 17.77C20 18.36 19.76 18.93 19.34 19.34C18.93 19.76 18.36 20 17.77 20L2.22 20C1.63 20 1.06 19.76 0.65 19.34C0.23 18.93 0 18.36 0 17.77L0 2.22C0 0.98 1 0 2.22 0L17.77 0ZM8.88 5.55C8.88 4.94 9.38 4.44 10 4.44C10.61 4.44 11.11 4.94 11.11 5.55L11.11 8.88L14.44 8.88C15.05 8.88 15.55 9.38 15.55 10C15.55 10.61 15.05 11.11 14.44 11.11L11.11 11.11L11.11 14.44C11.11 15.05 10.61 15.55 10 15.55C9.38 15.55 8.88 15.05 8.88 14.44L8.88 11.11L5.55 11.11C4.94 11.11 4.44 10.61 4.44 10C4.44 9.38 4.94 8.88 5.55 8.88L8.88 8.88L8.88 5.55Z" fill="currentColor"/>
        </svg>
      }
      @case ('delete') {
        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" [attr.aria-label]="'Удалить'">
          <path d="M3.34 20C2.87 20 2.47 19.83 2.14 19.51C1.81 19.18 1.5 18.79 1.5 18.33L1.5 3L1 3C0.44 3 0 2.55 0 2C0 1.44 0.44 1 1 1L6.78 1C6.78 0.44 7.23 0 7.78 0L13.21 0C13.76 0 14.21 0.44 14.21 1L20 1C20.55 1 21 1.44 21 2C21 2.55 20.55 3 20 3L19.5 3L19.5 18.33C19.5 18.77 19.17 19.16 18.84 19.5C18.5 19.83 18.1 20 17.65 20L3.34 20ZM17.5 3L3.5 3L3.5 18L17.5 18L17.5 3ZM6.5 14.96C6.5 15.5 6.93 15.96 7.48 15.96C8.04 15.96 8.5 15.52 8.5 14.96L8.5 5.96C8.5 5.41 8.06 4.96 7.51 4.96C6.95 4.96 6.5 5.4 6.5 5.96L6.5 14.96ZM12.5 14.9C12.5 15.46 12.95 15.91 13.51 15.9C14.06 15.89 14.5 15.45 14.5 14.9L14.5 5.96C14.5 5.4 14.04 4.95 13.48 4.96C12.93 4.97 12.5 5.41 12.5 5.96L12.5 14.9Z" fill="currentColor"/>
        </svg>
      }
      @case ('refresh') {
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" [attr.aria-label]="'Обновить'">
          <path d="M17.5 3.5V8.5H12.5L15.18 5.82C13.84 4.48 11.98 3.5 10 3.5C6.41 3.5 3.5 6.41 3.5 10C3.5 13.59 6.41 16.5 10 16.5C13.59 16.5 16.5 13.59 16.5 10H18.5C18.5 14.7 14.7 18.5 10 18.5C5.3 18.5 1.5 14.7 1.5 10C1.5 5.3 5.3 1.5 10 1.5C12.36 1.5 14.5 2.5 16 4L17.5 3.5Z" fill="currentColor"/>
        </svg>
      }
      @default {
        @if (isMaterialIcon(icon())) {
          <mat-icon>{{ icon() }}</mat-icon>
        }
      }
    }
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      width: 100%;
      height: 100%;
    }

    mat-icon {
      font-size: inherit;
      width: auto;
      height: auto;
    }
  `]
})
export class ButtonIconComponent {
  readonly icon = input.required<ButtonIconType>();

  readonly isMaterialIcon = (icon: string): boolean => {
    // Material icons are usually single words without spaces
    return !['add', 'delete', 'refresh'].includes(icon) && !icon.includes(' ');
  };
}
