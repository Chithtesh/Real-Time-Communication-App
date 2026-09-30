import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private subs = new Map<string, Subject<any>>();

  private static readonly EVENTS = [
    'room-participants', 'user-joined', 'user-left', 'offer', 'answer', 'ice-candidate',
    'receive-message', 'draw', 'erase', 'clear-board', 'screen-share-started',
    'screen-share-stopped', 'participants-updated', 'participant-updated',
  ];

  connect(token: string): void {
    if (this.socket && this.socket.connected) return;
    if (!this.socket) {
      this.socket = io(environment.socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
      SocketService.EVENTS.forEach((event) => {
        const subj = this.getSubj(event);
        this.socket!.on(event, (data: any) => subj.next(data));
      });
      this.socket.on('connect_error', (e) => console.error('[socket] connect_error', e));
    }
  }

  private getSubj(event: string): Subject<any> {
    if (!this.subs.has(event)) this.subs.set(event, new Subject<any>());
    return this.subs.get(event) as Subject<any>;
  }

  on(event: string): Observable<any> { return this.getSubj(event).asObservable(); }
  emit(event: string, data?: any): void { this.socket?.emit(event, data); }
  get id(): string | undefined { return this.socket?.id; }
  get connected(): boolean { return !!this.socket?.connected; }

  disconnect(): void {
    if (this.socket) { this.socket.removeAllListeners(); this.socket.disconnect(); this.socket = null; }
    this.subs.clear();
  }

  ngOnDestroy(): void { this.disconnect(); }
}
