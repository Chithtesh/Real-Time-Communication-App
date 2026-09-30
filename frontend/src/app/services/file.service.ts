import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SharedFile } from '../models/file';

@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(private http: HttpClient) {}
  upload(meetingId: string, file: File): Observable<HttpEvent<{ success: boolean; file: SharedFile }>> {
    const fd = new FormData();
    fd.append('meetingId', meetingId);
    fd.append('file', file);
    return this.http.post<{ success: boolean; file: SharedFile }>(environment.apiUrl + '/files/upload', fd, { reportProgress: true, observe: 'events' });
  }
  list(meetingId: string): Observable<{ success: boolean; files: SharedFile[] }> {
    return this.http.get<{ success: boolean; files: SharedFile[] }>(environment.apiUrl + '/files/meeting/' + meetingId);
  }
  downloadUrl(id: string): string {
    const token = localStorage.getItem('connecthub_token') || '';
    return environment.apiUrl + '/files/' + id + '?token=' + encodeURIComponent(token);
  }
}
