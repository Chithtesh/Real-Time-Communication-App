import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WhiteboardService } from '../../services/whiteboard.service';
@Component({
  selector: 'app-whiteboard', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="wb-toolbar">
      <input type="color" [(ngModel)]="color" title="Color">
      <input type="range" min="1" max="24" [(ngModel)]="size" title="Brush size">
      <button class="btn btn-sm" [class.btn-primary]="!erase" [class.btn-secondary]="erase" (click)="erase=false">Pen</button>
      <button class="btn btn-sm" [class.btn-primary]="erase" [class.btn-secondary]="!erase" (click)="erase=true">Eraser</button>
      <button class="btn btn-sm btn-outline-light" (click)="clear()">Clear</button>
      <button class="btn btn-sm btn-outline-light" (click)="download()">Save</button>
    </div>
    <div style="flex:1;min-height:0;position:relative">
      <canvas #c class="wb-canvas" (pointerdown)="down($event)" (pointermove)="move($event)" (pointerup)="up()" (pointerleave)="up()"></canvas>
    </div>`
})
export class WhiteboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('c') canvas?: ElementRef<HTMLCanvasElement>;
  color = '#4f46e5'; size = 4; erase = false;
  private ctx?: CanvasRenderingContext2D; private drawing = false; private last = { x: 0, y: 0 };
  private subs: Subscription[] = [];
  constructor(private wb: WhiteboardService) {}
  ngAfterViewInit(): void {
    const c = this.canvas!.nativeElement;
    const resize = () => { const r = c.getBoundingClientRect(); const img = this.ctx ? c.toDataURL() : null; c.width = r.width; c.height = r.height; this.ctx = c.getContext('2d')!; this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round'; if (img) { const i = new Image(); i.onload = () => this.ctx!.drawImage(i, 0, 0, c.width, c.height); i.src = img; } };
    resize();
    window.addEventListener('resize', resize);
    this.subs.push(this.wb.onDraw().subscribe((d) => this.stroke(d.from, d.to, d.color, d.size)));
    this.subs.push(this.wb.onClear().subscribe(() => this.clearLocal()));
  }
  private pos(e: PointerEvent) { const r = this.canvas!.nativeElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  down(e: PointerEvent): void { this.drawing = true; this.last = this.pos(e); }
  move(e: PointerEvent): void { if (!this.drawing) return; const p = this.pos(e); const color = this.erase ? '#ffffff' : this.color; this.stroke(this.last, p, color, this.size); this.wb.draw({ from: this.last, to: p, color, size: this.size }); this.last = p; }
  up(): void { this.drawing = false; }
  private stroke(a: any, b: any, color: string, size: number): void { if (!this.ctx) return; this.ctx.strokeStyle = color; this.ctx.lineWidth = size; this.ctx.beginPath(); this.ctx.moveTo(a.x, a.y); this.ctx.lineTo(b.x, b.y); this.ctx.stroke(); }
  clear(): void { this.clearLocal(); this.wb.clear(); }
  private clearLocal(): void { const c = this.canvas!.nativeElement; if (this.ctx) this.ctx.clearRect(0, 0, c.width, c.height); }
  download(): void { const a = document.createElement('a'); a.href = this.canvas!.nativeElement.toDataURL('image/png'); a.download = 'connecthub-whiteboard.png'; a.click(); }
  ngOnDestroy(): void { this.subs.forEach((s) => s.unsubscribe()); }
}
