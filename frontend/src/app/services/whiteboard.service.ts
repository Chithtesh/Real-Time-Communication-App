import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class WhiteboardService {
  constructor(private socket: SocketService) {}
  draw(data: any): void { this.socket.emit('draw', data); }
  erase(data: any): void { this.socket.emit('erase', data); }
  clear(): void { this.socket.emit('clear-board', {}); }
  onDraw(): Observable<any> { return this.socket.on('draw'); }
  onErase(): Observable<any> { return this.socket.on('erase'); }
  onClear(): Observable<any> { return this.socket.on('clear-board'); }
}
