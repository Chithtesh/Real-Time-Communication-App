import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { WebRTCService } from '../../services/webrtc.service';
import { MeetingService } from '../../services/meeting.service';
import { ToastService } from '../../services/toast.service';
import { VideoGridComponent, VideoParticipant } from '../../components/video-grid/video-grid.component';
import { MeetingControlsComponent } from '../../components/meeting-controls/meeting-controls.component';
import { ChatComponent } from '../../components/chat/chat.component';
import { FileSharingComponent } from '../../components/file-sharing/file-sharing.component';
import { WhiteboardComponent } from '../../components/whiteboard/whiteboard.component';
import { ParticipantsComponent } from '../../components/participants/participants.component';

@Component({
  selector: 'app-meeting-room', standalone: true,
  imports: [CommonModule, VideoGridComponent, MeetingControlsComponent, ChatComponent, FileSharingComponent, WhiteboardComponent, ParticipantsComponent],
  templateUrl: './meeting-room.component.html',
})
export class MeetingRoomComponent implements OnInit, OnDestroy {
  @ViewChild('chat') chatRef?: ChatComponent;
  @ViewChild('files') filesRef?: FileSharingComponent;
  meetingId = '';
  participants: VideoParticipant[] = [];
  panel = '';
  micOff = false; camOff = false; sharing = false; connected = false;
  private subs: Subscription[] = [];
  private mySocketId = 'me';

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService,
    private socket: SocketService, private rtc: WebRTCService, private meetings: MeetingService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    this.meetingId = (this.route.snapshot.paramMap.get('meetingId') || '').toUpperCase();
    const token = this.auth.getToken();
    if (!token) { this.router.navigate(['/login']); return; }
    this.socket.connect(token);
    this.setupSignaling();
    try { await this.rtc.initLocalMedia(); } catch { this.toast.error('Camera/microphone unavailable. Chat, files and whiteboard still work.'); }
    this.rtc.setCallbacks({
      onIce: (peer, c) => this.socket.emit('ice-candidate', { to: peer, candidate: c.toJSON() }),
      onOffer: (peer, offer) => this.socket.emit('offer', { to: peer, offer }),
      onAnswer: (peer, answer) => this.socket.emit('answer', { to: peer, answer }),
      onStream: (peer, stream) => this.attachStream(peer, stream),
    });
    this.mySocketId = this.socket.id || 'me';
    this.upsertLocal();
    this.meetings.join(this.meetingId).subscribe({ error: () => {} });
    this.socket.emit('join-room', { meetingId: this.meetingId });
    this.connected = true;
  }

  private setupSignaling(): void {
    this.subs.push(this.socket.on('room-participants').subscribe((d) => { (d.participants || []).forEach((p: any) => { if (this.addRemote(p.socketId, p.name)) this.rtc.createOfferTo(p.socketId); }); }));
    this.subs.push(this.socket.on('user-joined').subscribe((d) => { this.addRemote(d.socketId, d.name); this.toast.info(d.name + ' joined the meeting'); }));
    this.subs.push(this.socket.on('user-left').subscribe((d) => { this.removeRemote(d.socketId); this.toast.info(d.name + ' left the meeting'); }));
    this.subs.push(this.socket.on('offer').subscribe((d) => this.rtc.handleOffer(d.from, d.offer)));
    this.subs.push(this.socket.on('answer').subscribe((d) => this.rtc.handleAnswer(d.from, d.answer)));
    this.subs.push(this.socket.on('ice-candidate').subscribe((d) => this.rtc.addIceCandidate(d.from, d.candidate)));
    this.subs.push(this.socket.on('receive-message').subscribe((d) => this.chatRef?.addMessage(d)));
    this.subs.push(this.socket.on('screen-share-started').subscribe((d) => { const p = this.participants.find((x) => x.socketId === d.socketId); if (p) p.sharing = true; this.toast.info(d.name + ' is sharing their screen'); }));
    this.subs.push(this.socket.on('screen-share-stopped').subscribe((d) => { const p = this.participants.find((x) => x.socketId === d.socketId); if (p) p.sharing = false; }));
  }

  private addRemote(socketId: string, name: string): boolean {
    if (!socketId || socketId === this.mySocketId) return false;
    if (this.participants.some((p) => p.socketId === socketId)) return false;
    this.participants.push({ socketId, name, stream: null, micOff: false, camOff: false, isLocal: false, sharing: false });
    return true;
  }
  private removeRemote(socketId: string): void { this.participants = this.participants.filter((p) => p.socketId !== socketId); this.rtc.closePeer(socketId); }
  private attachStream(socketId: string, stream: MediaStream): void {
    const p = this.participants.find((x) => x.socketId === socketId);
    if (p) p.stream = stream; else this.participants.push({ socketId, name: 'Guest', stream, micOff: false, camOff: false, isLocal: false, sharing: false });
  }
  private upsertLocal(): void {
    const data: VideoParticipant = { socketId: this.mySocketId, name: this.auth.currentUser()?.name || 'You', stream: this.rtc.localStream, micOff: this.micOff, camOff: this.camOff, isLocal: true, sharing: this.sharing };
    const ex = this.participants.find((p) => p.isLocal);
    if (ex) Object.assign(ex, data); else this.participants.unshift(data);
  }

  toggleMic(): void { const t = this.rtc.localStream ? this.rtc.localStream.getAudioTracks()[0] : null; if (!t) return; t.enabled = !t.enabled; this.micOff = !t.enabled; this.upsertLocal(); this.socket.emit('participant-updated', { muted: this.micOff }); }
  toggleCam(): void { const t = this.rtc.localStream ? this.rtc.localStream.getVideoTracks()[0] : null; if (!t) return; t.enabled = !t.enabled; this.camOff = !t.enabled; this.upsertLocal(); this.socket.emit('participant-updated', { cameraOff: this.camOff }); }
  async toggleShare(): Promise<void> {
    if (this.sharing) { this.stopShareInternal(); return; }
    const s = await this.rtc.startScreenShare();
    if (s) { this.sharing = true; this.upsertLocal(); this.socket.emit('screen-share-started'); const tr = s.getVideoTracks()[0]; if (tr) tr.onended = () => this.stopShareInternal(); }
  }
  private stopShareInternal(): void { this.rtc.stopScreenShare(); this.sharing = false; this.upsertLocal(); this.socket.emit('screen-share-stopped'); }
  openPanel(p: string): void { this.panel = this.panel === p ? '' : p; if (p === 'files') setTimeout(() => this.filesRef?.load(), 0); }
  leave(): void { this.destroy(); this.meetings.leave(this.meetingId).subscribe({ error: () => {} }); this.router.navigate(['/dashboard']); }
  private destroy(): void { this.socket.emit('leave-room', { meetingId: this.meetingId }); this.rtc.closeAll(); }
  ngOnDestroy(): void { this.destroy(); this.subs.forEach((s) => s.unsubscribe()); }
}
