import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface PeerCallbacks {
  onIce: (peerId: string, candidate: RTCIceCandidate) => void;
  onOffer: (peerId: string, offer: RTCSessionDescriptionInit) => void;
  onAnswer: (peerId: string, answer: RTCSessionDescriptionInit) => void;
  onStream: (peerId: string, stream: MediaStream) => void;
}

interface PeerHandle { pc: RTCPeerConnection; remoteStream: MediaStream; }

@Injectable({ providedIn: 'root' })
export class WebRTCService {
  localStream: MediaStream | null = null;
  screenStream: MediaStream | null = null;
  private peers = new Map<string, PeerHandle>();
  private pending = new Map<string, RTCIceCandidateInit[]>();
  private cb: PeerCallbacks | null = null;

  async initLocalMedia(): Promise<MediaStream> {
    if (this.localStream) return this.localStream;
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return this.localStream;
  }

  setCallbacks(cb: PeerCallbacks): void { this.cb = cb; }

  private ensurePeer(peerId: string): PeerHandle {
    let h = this.peers.get(peerId);
    if (h) return h;
    const pc = new RTCPeerConnection({ iceServers: environment.iceServers });
    const remoteStream = new MediaStream();
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => pc.addTrack(t, this.localStream as MediaStream));
    }
    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((tr) => {
        if (!remoteStream.getTracks().some((x) => x.id === tr.id)) remoteStream.addTrack(tr);
      });
      this.cb?.onStream(peerId, remoteStream);
    };
    pc.onicecandidate = (e) => { if (e.candidate) this.cb?.onIce(peerId, e.candidate); };
    h = { pc, remoteStream };
    this.peers.set(peerId, h);
    return h;
  }

  async createOfferTo(peerId: string): Promise<void> {
    const h = this.ensurePeer(peerId);
    const offer = await h.pc.createOffer();
    await h.pc.setLocalDescription(offer);
    this.cb?.onOffer(peerId, offer);
  }

  async handleOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const h = this.ensurePeer(peerId);
    await h.pc.setRemoteDescription(new RTCSessionDescription(offer));
    await this.flush(peerId);
    const answer = await h.pc.createAnswer();
    await h.pc.setLocalDescription(answer);
    this.cb?.onAnswer(peerId, answer);
  }

  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const h = this.peers.get(peerId);
    if (!h) return;
    await h.pc.setRemoteDescription(new RTCSessionDescription(answer));
    await this.flush(peerId);
  }

  async addIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const h = this.peers.get(peerId);
    if (!h || !h.pc.remoteDescription) {
      const arr = this.pending.get(peerId) || [];
      arr.push(candidate);
      this.pending.set(peerId, arr);
      return;
    }
    try { await h.pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* ignore */ }
  }

  private async flush(peerId: string): Promise<void> {
    const arr = this.pending.get(peerId);
    if (!arr) return;
    const h = this.peers.get(peerId);
    if (h) { for (const c of arr) { try { await h.pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* ignore */ } } }
    this.pending.delete(peerId);
  }

  getRemoteStream(peerId: string): MediaStream | undefined { return this.peers.get(peerId)?.remoteStream; }

  async startScreenShare(): Promise<MediaStream | null> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = this.screenStream.getVideoTracks()[0];
      this.peers.forEach((h) => {
        const sender = h.pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(track);
      });
      return this.screenStream;
    } catch {
      return null;
    }
  }

  stopScreenShare(): void {
    if (!this.screenStream) return;
    const camTrack = this.localStream ? this.localStream.getVideoTracks()[0] : null;
    this.peers.forEach((h) => {
      const sender = h.pc.getSenders().find((s) => s.track && s.track.kind === 'video');
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });
    this.screenStream.getTracks().forEach((t) => t.stop());
    this.screenStream = null;
  }

  closePeer(peerId: string): void {
    const h = this.peers.get(peerId);
    if (h) { h.pc.close(); this.peers.delete(peerId); }
    this.pending.delete(peerId);
  }

  closeAll(): void {
    this.peers.forEach((h) => h.pc.close());
    this.peers.clear();
    this.pending.clear();
    if (this.localStream) { this.localStream.getTracks().forEach((t) => t.stop()); this.localStream = null; }
    if (this.screenStream) { this.screenStream.getTracks().forEach((t) => t.stop()); this.screenStream = null; }
  }
}
