import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../services/toast.service';
import { SharedFile } from '../../models/file';
@Component({
  selector: 'app-file-sharing', standalone: true, imports: [CommonModule],
  template: `
    <div class="p-3">
      <input #file type="file" hidden (change)="onFile($event)">
      <button class="btn btn-sm btn-primary w-100 mb-3" (click)="file.click()"><i class="fa-solid fa-upload me-1"></i>Upload file</button>
      <div class="progress mb-2" *ngIf="uploading" style="height:6px"><div class="progress-bar" [style.width.%]="progress"></div></div>
      <div class="participant-row" *ngFor="let f of files">
        <div class="text-truncate"><i class="fa-solid fa-file me-2"></i>{{ f.originalName }}<div class="small text-muted">{{ f.uploaderName }}  {{ size(f.fileSize) }}</div></div>
        <a class="btn btn-sm btn-outline-light" [href]="downloadUrl(f)" target="_blank"><i class="fa-solid fa-download"></i></a>
      </div>
      <p class="text-muted small mt-2 mb-0">Allowed: PDF, DOC, TXT, images, ZIP. Max 25MB.</p>
    </div>`
})
export class FileSharingComponent {
  @Input() meetingId = '';
  files: SharedFile[] = [];
  uploading = false; progress = 0;
  constructor(private svc: FileService, private toast: ToastService) {}
  load(): void { this.svc.list(this.meetingId).subscribe({ next: (r) => (this.files = r.files || []), error: () => {} }); }
  onFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.uploading = true; this.progress = 0;
    this.svc.upload(this.meetingId, file).subscribe({
      next: (ev) => {
        if (ev.type === HttpEventType.UploadProgress && ev.total) this.progress = Math.round((ev.loaded / ev.total) * 100);
        else if (ev.type === HttpEventType.Response) { this.uploading = false; this.toast.success('File uploaded'); this.files.unshift(ev.body!.file); input.value = ''; }
      },
      error: (err) => { this.uploading = false; this.toast.error(err?.error?.message || 'Upload failed'); input.value = ''; },
    });
  }
  downloadUrl(f: SharedFile): string { return this.svc.downloadUrl(f._id); }
  size(b: number): string { return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
}
