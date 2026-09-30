import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message } from '../models/message';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient, private socket: SocketService) {}
  history(meetingId: string): Observable<{ success: boolean; messages: Message[] }> {
    return this.http.get<{ success: boolean; messages: Message[] }>(environment.apiUrl + '/messages/' + meetingId);
  }
  send(meetingId: string, message: string): void { this.socket.emit('send-message', { meetingId, message }); }
  messages$(): Observable<any> { return this.socket.on('receive-message'); }
}
