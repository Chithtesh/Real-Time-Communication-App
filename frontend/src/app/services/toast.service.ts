import { Injectable } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];
  private counter = 0;

  show(message: string, type: Toast['type'] = 'info'): void {
    const toast: Toast = { id: ++this.counter, message, type };
    this.toasts.push(toast);
    setTimeout(() => this.remove(toast.id), 4000);
  }
  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }
  remove(id: number): void { this.toasts = this.toasts.filter((t) => t.id !== id); }
}
