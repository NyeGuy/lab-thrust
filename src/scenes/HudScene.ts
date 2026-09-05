import Phaser from "phaser";
import { getDockMode, requestDockAction } from "../dock";
import { getEnergy } from "../energy";
import { FEEL, remapStick, readSafeInsets, idleStick } from "../feel";
import { getStick, setStick } from "../input/stickState";
import { getMapSnap } from "../mapState";

export class HudScene extends Phaser.Scene {
  private ring!: Phaser.GameObjects.Arc;
  private knob!: Phaser.GameObjects.Arc;
  private hint!: Phaser.GameObjects.Text;
  private barTrack!: Phaser.GameObjects.Rectangle;
  private barFill!: Phaser.GameObjects.Rectangle;
  private dockBtn!: Phaser.GameObjects.Arc;
  private dockLabel!: Phaser.GameObjects.Text;
  private barWidth = 220;
  private barInner = 212;
  private dockX = 0;
  private dockY = 0;
  private mapGfx!: Phaser.GameObjects.Graphics;
  private mapX = 0;
  private mapY = 0;
  private pointerId: number | null = null;
  private originX = 0;
  private originY = 0;
  private hintFading = false;
  private emptyPulse = 0;

  constructor() {
    super({ key: "hud" });
  }

  create(): void {
    this.ring = this.add.circle(0, 0, FEEL.stickRadius, 0xffffff, 0.06);
    this.ring.setStrokeStyle(2, 0xffffff, 0.28);
    this.ring.setScrollFactor(0);
    this.ring.setDepth(10);

    this.knob = this.add.circle(0, 0, 26, 0xffffff, 0.22);
    this.knob.setStrokeStyle(2, 0xffffff, 0.45);
    this.knob.setScrollFactor(0);
    this.knob.setDepth(11);

    this.hint = this.add
      .text(0, 0, "drag to thrust", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        color: "#c8d0dc",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setAlpha(0.78)
      .setDepth(12);

    this.barTrack = this.add.rectangle(0, 0, this.barWidth, 10, 0xffffff, 0.1);
    this.barTrack.setStrokeStyle(1, 0xffffff, 0.28);
    this.barTrack.setScrollFactor(0);
    this.barTrack.setDepth(12);

    this.barFill = this.add.rectangle(0, 0, this.barInner, 6, 0x7ee8ff, 0.92);
    this.barFill.setOrigin(0, 0.5);
    this.barFill.setScrollFactor(0);
    this.barFill.setDepth(13);

    this.dockBtn = this.add.circle(0, 0, 34, 0xffffff, 0.12);
    this.dockBtn.setStrokeStyle(2, 0xffffff, 0.4);
    this.dockBtn.setScrollFactor(0);
    this.dockBtn.setDepth(14);
    this.dockBtn.setVisible(false);

    this.dockLabel = this.add
      .text(0, 0, "dock", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#e8eef6",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(15)
      .setVisible(false);

    this.mapGfx = this.add.graphics();
    this.mapGfx.setScrollFactor(0);
    this.mapGfx.setDepth(16);

    this.layout();
    this.scale.on("resize", this.layout, this);

    this.input.addPointer(1);
    this.input.on("pointerdown", this.onDown, this);
    this.input.on("pointermove", this.onMove, this);
    this.input.on("pointerup", this.onUp, this);
    this.input.on("pointerupoutside", this.onUp, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.layout, this);
    });
  }

  private layout = (): void => {
    const w = this.scale.width;
    const h = this.scale.height;
    const safe = readSafeInsets();
    const margin = 18;
    this.originX = safe.left + margin + FEEL.stickRadius;
    this.originY = h - safe.bottom - margin - FEEL.stickRadius;
    this.ring.setPosition(this.originX, this.originY);
    this.knob.setPosition(this.originX, this.originY);
    this.mapX = safe.left + 10;
    this.mapY = safe.top + 10;
    const mapRight = this.mapX + FEEL.mapSize + 12;
    this.barWidth = Math.min(220, Math.max(132, w - mapRight - 16));
    this.barInner = this.barWidth - 8;
    this.barTrack.setSize(this.barWidth, 10);
    this.barFill.setSize(this.barInner, 6);
    const barY = this.mapY + 18;
    this.hint.setPosition(mapRight + this.barWidth / 2, barY + 16);
    this.barTrack.setPosition(mapRight + this.barWidth / 2, barY);
    this.barFill.setPosition(mapRight + 4, barY);
    this.dockX = this.originX + FEEL.stickRadius + 52;
    this.dockY = this.originY;
    this.dockBtn.setPosition(this.dockX, this.dockY);
    this.dockLabel.setPosition(this.dockX, this.dockY);
    if (this.pointerId === null) {
      setStick(idleStick);
    }
  };

  private onDown = (pointer: Phaser.Input.Pointer): void => {
    if (this.pointerId !== null) {
      return;
    }
    if (this.hitDock(pointer)) {
      requestDockAction();
      this.fadeHint();
      return;
    }
    const reach = FEEL.stickRadius + FEEL.stickHitPad;
    const dx = pointer.position.x - this.originX;
    const dy = pointer.position.y - this.originY;
    if (dx * dx + dy * dy > reach * reach) {
      return;
    }
    this.pointerId = pointer.id;
    this.applyPointer(pointer);
    this.fadeHint();
  };

  private onMove = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id !== this.pointerId) {
      return;
    }
    this.applyPointer(pointer);
  };

  private onUp = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id !== this.pointerId) {
      return;
    }
    this.pointerId = null;
    this.knob.setPosition(this.originX, this.originY);
    setStick(idleStick);
  };

  private applyPointer(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.position.x - this.originX;
    const dy = pointer.position.y - this.originY;
    const rawLen = Math.hypot(dx, dy);
    const clamped = Math.min(rawLen, FEEL.stickRadius);
    const nx = rawLen > 0 ? dx / rawLen : 0;
    const ny = rawLen > 0 ? dy / rawLen : 0;
    const magnitude = remapStick(clamped / FEEL.stickRadius);
    this.knob.setPosition(this.originX + nx * clamped, this.originY + ny * clamped);
    setStick({
      x: nx * magnitude,
      y: ny * magnitude,
      magnitude,
      active: magnitude > 0,
    });
  }

  update(_time: number, delta: number): void {
    const energy = getEnergy();
    this.barFill.setScale(Math.max(0.001, energy), 1);
    this.barFill.setVisible(energy > 0);
    this.barFill.setFillStyle(energyColor(energy), 0.92);

    const dry = getStick().active && energy <= 0;
    if (dry) {
      this.emptyPulse += delta * 0.01;
      const flash = 0.22 + 0.28 * (0.5 + 0.5 * Math.sin(this.emptyPulse * 7));
      this.barTrack.setStrokeStyle(2, 0xff9a9a, 0.35 + flash);
      this.barTrack.setFillStyle(0xff6a6a, 0.08 + flash * 0.25);
    } else {
      this.emptyPulse = 0;
      this.barTrack.setStrokeStyle(1, 0xffffff, 0.28);
      this.barTrack.setFillStyle(0xffffff, 0.1);
    }

    const dock = getDockMode();
    const show = dock !== "hidden";
    this.dockBtn.setVisible(show);
    this.dockLabel.setVisible(show);
    if (show) {
      this.dockLabel.setText(dock);
    }

    this.drawMap();
  }

  private drawMap(): void {
    const snap = getMapSnap();
    const size = FEEL.mapSize;
    const pad = 7;
    const scale = (size / 2 - pad) / FEEL.mapWorld;
    const cx = this.mapX + size / 2;
    const cy = this.mapY + size / 2;
    const clampR = size / 2 - 5;
    const g = this.mapGfx;
    g.clear();
    g.fillStyle(0x0a1018, 0.78);
    g.fillRoundedRect(this.mapX, this.mapY, size, size, 10);
    g.lineStyle(1, 0xffffff, 0.26);
    g.strokeRoundedRect(this.mapX, this.mapY, size, size, 10);
    g.lineStyle(1, 0xffffff, 0.12);
    g.strokeCircle(cx, cy, 560 * scale);
    g.strokeCircle(cx, cy, 900 * scale);
    g.fillStyle(0xffc24a, 1);
    g.fillCircle(cx, cy, 4);
    plot(g, cx, cy, snap.clayX, snap.clayY, scale, clampR, 0xc47a4a, 3.4);
    plot(g, cx, cy, snap.iceX, snap.iceY, scale, clampR, 0x7aa0b8, 3);
    plot(g, cx, cy, snap.shipX, snap.shipY, scale, clampR, 0x7ee8ff, 2.2);
  }

  private hitDock(pointer: Phaser.Input.Pointer): boolean {
    if (getDockMode() === "hidden") {
      return false;
    }
    const dx = pointer.position.x - this.dockX;
    const dy = pointer.position.y - this.dockY;
    return dx * dx + dy * dy <= 40 * 40;
  }

  private fadeHint(): void {
    if (this.hintFading) {
      return;
    }
    this.hintFading = true;
    this.tweens.add({
      targets: this.hint,
      alpha: 0,
      duration: 700,
      delay: 280,
      ease: "Quad.easeOut",
    });
  }
}

function plot(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  x: number,
  y: number,
  scale: number,
  clampR: number,
  color: number,
  r: number,
): void {
  let dx = x * scale;
  let dy = y * scale;
  const dist = Math.hypot(dx, dy);
  if (dist > clampR) {
    dx = (dx / dist) * clampR;
    dy = (dy / dist) * clampR;
  }
  g.fillStyle(color, 1);
  g.fillCircle(cx + dx, cy + dy, r);
}

function energyColor(energy: number): number {
  if (energy > 0.35) {
    return 0x7ee8ff;
  }
  if (energy > 0.14) {
    return 0xf0c56a;
  }
  return 0xf08a8a;
}
