import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-video-card', standalone: true, imports: [CommonModule],
  template: `
    <div class="video-card">
      <video #v autoplay playsinline [muted]="playbackMuted"></video>
      <span class="vc-name"><i class="fa-solid fa-desktop me-1" *ngIf="sharing"></i>{{ name }}<span *ngIf="isLocal"> (You)</span></span>
      <span class="vc-status">
        <i class="fa-solid" [class.fa-microphone]="!micOff" [class.fa-microphone-slash]="micOff" [class.mic-off]="micOff"></i>
        <i class="fa-solid ms-1" [class.fa-video]="!camOff" [class.fa-video-slash]="camOff" [class.mic-off]="camOff"></i>
      </span>
    </div>`
})
export class VideoCardComponent implements AfterViewInit {
  @ViewChild('v') video?: ElementRef<HTMLVideoElement>;
  private _stream: MediaStream | null = null;
  @Input() set stream(s: MediaStream | null) { this._stream = s; if (this.video) this.video.nativeElement.srcObject = s; }
  get stream(): MediaStream | null { return this._stream; }
  @Input() name = ''; @Input() playbackMuted = false; @Input() micOff = false; @Input() camOff = false; @Input() isLocal = false; @Input() sharing = false;
  ngAfterViewInit(): void { if (this.video && this._stream) this.video.nativeElement.srcObject = this._stream; }
}
