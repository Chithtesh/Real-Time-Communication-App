import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Meeting } from '../models/meeting';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  constructor(private http: HttpClient) {}
  create(title?: string) { return this.http.post<{ success: boolean; meeting: Meeting }>(environment.apiUrl + '/meetings', { title }); }
  list() { return this.http.get<{ success: boolean; meetings: Meeting[] }>(environment.apiUrl + '/meetings'); }
  get(meetingId: string) { return this.http.get<{ success: boolean; meeting: Meeting }>(environment.apiUrl + '/meetings/' + meetingId); }
  join(meetingId: string) { return this.http.post<{ success: boolean; meeting: Meeting }>(environment.apiUrl + '/meetings/' + meetingId + '/join', {}); }
  leave(meetingId: string) { return this.http.post<{ success: boolean }>(environment.apiUrl + '/meetings/' + meetingId + '/leave', {}); }
}
