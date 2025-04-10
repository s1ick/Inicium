import { Component, inject, signal, computed, viewChild, OnInit, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, of } from 'rxjs';

// Components
import { CheckboxComponent } from './ui-kit/checkbox/checkbox.component';
import { ButtonComponent } from './ui-kit/button/button.component';
import { UserDialogComponent, type DialogData } from './ui-kit/user-dialog/user-dialog.component';

// Services & Models
import { ApiService } from 'src/services/api.cervice';
import type { User } from './models/user.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSortModule,
    CheckboxComponent,
    ButtonComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // ===== DEPENDENCY INJECTION =====
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(ApiService);

  // ===== VIEW REFERENCES =====
  private readonly sortRef = viewChild(MatSort);

  // ===== STATE WITH SIGNALS =====
  readonly users = signal<User[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // ===== REACTIVE SELECTION MANAGEMENT =====
  private readonly _selection = signal<SelectionModel<User>>(new SelectionModel<User>(true, []));
  readonly selection = this._selection.asReadonly();

  // ===== COMPUTED VALUES =====
  readonly displayedColumns = computed(() => [
    'select',
    'name',
    'surname',
    'email',
    'phone'
  ]);

  readonly dataSource = computed(() => {
    const dataSource = new MatTableDataSource(this.users());
    const sort = this.sortRef();

    if (sort) {
      dataSource.sort = sort;
      dataSource.sortingDataAccessor = this.sortingDataAccessor;
    }

    return dataSource;
  });

  readonly hasSelected = computed(() =>
    this.selection().selected.length > 0
  );

  readonly isAllSelected = computed(() => {
    const numSelected = this.selection().selected.length;
    const numRows = this.users().length;
    return numSelected === numRows && numRows > 0;
  });

  readonly selectedCount = computed(() =>
    this.selection().selected.length
  );

  // ===== LIFECYCLE =====
  ngOnInit() {
    this.loadUsers();
  }

  // ===== PUBLIC METHODS =====
  readonly loadUsers = () => {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getUsers().pipe(
      catchError((err) => {
        console.error('Ошибка загрузки:', err);
        this.error.set('Не удалось загрузить пользователей');
        this.isLoading.set(false);
        return of({ users: [] });
      })
    ).subscribe({
      next: (response) => {
        const processedUsers = response.users.map((user, index) => ({
          ...user,
          id: user.id || index + 1,
          phone: user.phone || 'Не указан',
        }));

        this.users.set(processedUsers);
        this.isLoading.set(false);

        // Инициализируем сортировку после загрузки данных
        this.initializeSorting();
      }
    });
  };

  readonly openAddDialog = (): void => {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '448px',
      data: { mode: 'add' } as DialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newUser: User = {
          ...result,
          id: this.generateId(),
          phone: result.phone || 'Не указан',
        };

        this.users.update(users => [...users, newUser]);
      }
    });
  };

  readonly openEditDialog = (user: User): void => {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '448px',
      data: {
        mode: 'edit',
        user: user,
      } as DialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.users.update(users =>
          users.map(item =>
            item.id === user.id ? { ...item, ...result } : item
          )
        );
      }
    });
  };

  readonly deleteSelected = async (): Promise<void> => {
    if (!this.hasSelected()) return;

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '448px',
      data: {
        mode: 'delete',
        count: this.selectedCount(),
      } as DialogData,
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      const selectedIds = new Set(this.selection().selected.map(user => user.id));
      this.users.update(users =>
        users.filter(user => !selectedIds.has(user.id))
      );
      this.clearSelection();
    }
  };

  readonly toggleAllSelection = (checked: boolean): void => {
    const selection = this.selection();
    if (checked) {
      selection.select(...this.users());
    } else {
      selection.clear();
    }
    // Создаем новый instance для trigger change detection
    this._selection.set(new SelectionModel<User>(true, [...selection.selected]));
  };

  readonly selectRow = (row: User): void => {
    const selection = this.selection();
    selection.toggle(row);
    // Создаем новый instance для trigger change detection
    this._selection.set(new SelectionModel<User>(true, [...selection.selected]));
  };

  readonly clearSelection = (): void => {
    this._selection.set(new SelectionModel<User>(true, []));
  };

  readonly getColumnName = (column: string): string => {
    const columnNames: Record<string, string> = {
      name: 'Имя',
      surname: 'Фамилия',
      email: 'Email',
      phone: 'Телефон',
    };
    return columnNames[column] || column;
  };

  // ===== PRIVATE METHODS =====
  private initializeSorting(): void {
    const sort = this.sortRef();
    if (sort) {
      afterNextRender(() => {
        setTimeout(() => {
          sort.sort({
            id: 'name',
            start: 'asc',
            disableClear: false
          });
        });
      });
    }
  }

  private readonly sortingDataAccessor = (data: User, property: string): string => {
    switch (property) {
      case 'name':
        return data.name.toLowerCase();
      case 'surname':
        return data.surname.toLowerCase();
      case 'email':
        return data.email.toLowerCase();
      case 'phone':
        return data.phone?.toLowerCase() || '';
      default:
        return '';
    }
  };

  private generateId(): number {
    const users = this.users();
    if (users.length === 0) return 1;

    const ids = users
      .map(user => user.id)
      .filter(id => id !== undefined) as number[];

    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }
}
