export interface User {
  id?: number; // Сделали необязательным
  name: string;
  surname: string;
  email: string;
  phone?: string;
  selected?: boolean;
}