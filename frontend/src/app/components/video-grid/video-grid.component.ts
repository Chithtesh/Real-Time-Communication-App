import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoCardComponent } from '../video-card/video-card.component';
export interface VideoParticipant { socketId: string; name: string; stream: MediaStream | null; micOff: boolean; camOff: boolean; isLocal: boolean; sharing: boolean; }
@Component({
  selector: 'app-video-grid', standalone: true, imports: [CommonModule, VideoCardComponent],
  template: `<div class="video-grid"><app-video-card *ngFor="let p of participants; trackBy: track" [stream]="p.stream" [name]="p.name" [micOff]="p.micOff" [camOff]="p.camOff" [isLocal]="p.isLocal" [sharing]="p.sharing" [playbackMuted]="p.isLocal"></app-video-card></div>`
})
export class VideoGridComponent { @Input() participants: VideoParticipant[] = []; track(_i: number, p: VideoParticipant): string { return p.socketId; } }
