import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule, MatSort, MatSortable } from '@angular/material/sort';
import { ApiService } from 'src/services/api.cervice';
import { User } from './models/user.interface';
import { CheckboxComponent } from './ui-kit/checkbox/checkbox.component';
import { SelectionModel } from '@angular/cdk/collections';
import { ButtonComponent } from './ui-kit/button/button.component';
import {
  UserDialogComponent,
  DialogData,
} from './ui-kit/user-dialog/user-dialog.component';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSortModule,
    CheckboxComponent,
    ButtonComponent,
    NgScrollbarModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'name', 'surname', 'email', 'phone'];
  dataSource = new MatTableDataSource<User>();
  isLoading = true;

  selection = new SelectionModel<User>(true, []);
  
  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this._sort = sort;
      this.dataSource.sort = this._sort;
      this.initSorting();
    }
  }
  private _sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private api: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  private initSorting(): void {
    this.dataSource.sortingDataAccessor = (data: User, property: string) => {
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
  }

  loadUsers(): void {
    this.isLoading = true;
    this.api.getUsers().subscribe({
      next: (response) => {
        this.dataSource.data = response.users.map((user, index) => ({
          ...user,
          id: user.id || index + 1,
          selected: false,
          phone: user.phone || 'Не указан',
        }));

        if (this._sort) {
          const sortState: MatSortable = {
            id: 'name',
            start: 'asc',
            disableClear: false
          };
          this._sort.sort(sortState);
        }

        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err);
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
    });
  }

  // Остальные методы остаются без изменений
  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '448px',
      data: { mode: 'add' } as DialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newUser = {
          ...result,
          id: this.generateId(),
          selected: false,
          phone: result.phone || 'Не указан',
        };
        this.dataSource.data = [...this.dataSource.data, newUser];
        this.cdRef.detectChanges();
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '448px',
      data: {
        mode: 'edit',
        user: user,
      } as DialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedData = this.dataSource.data.map((item) =>
          item.id === user.id ? { ...item, ...result } : item
        );
        this.dataSource.data = updatedData;
        this.cdRef.detectChanges();
      }
    });
  }

  async deleteSelected(): Promise<void> {
    const selectedCount = this.selection.selected.length;
    if (selectedCount === 0) return;

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '448px',
      minWidth: '448px',
      data: {
        mode: 'delete',
        count: selectedCount,
      } as DialogData,
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.dataSource.data = this.dataSource.data.filter(
        (user) => !this.selection.isSelected(user)
      );
      this.selection.clear();
      this.cdRef.detectChanges();
    }
  }

  hasSelected(): boolean {
    return this.selection.selected.length > 0;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  toggleAllSelection(checked: boolean): void {
    if (checked) {
      this.selection.select(...this.dataSource.data);
      this.dataSource.data.forEach((user) => (user.selected = true));
    } else {
      this.selection.clear();
      this.dataSource.data.forEach((user) => (user.selected = false));
    }
    this.cdRef.detectChanges();
  }

  selectRow(row: User): void {
    this.selection.toggle(row);
    row.selected = this.selection.isSelected(row);
    this.cdRef.detectChanges();
  }

  private generateId(): number {
    if (this.dataSource.data.length === 0) return 1;
    
    // Добавляем фильтрацию для исключения undefined значений
    const ids = this.dataSource.data
      .map(user => user.id)
      .filter(id => id !== undefined) as number[];
      
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  getColumnName(column: string): string {
    const columnNames: Record<string, string> = {
      name: 'Имя',
      surname: 'Фамилия',
      email: 'Email',
      phone: 'Телефон',
    };
    return columnNames[column] || column;
  }
}