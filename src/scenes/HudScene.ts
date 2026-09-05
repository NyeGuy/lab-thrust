import Phaser from "phaser";
import { getDockMode, requestDockAction } from "../dock";
import { getEnergy } from "../energy";
import { FEEL, remapStick, readSafeInsets, idleStick } from "../feel";
import { getStick, setStick } from "../input/stickState";

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
    this.barWidth = Math.min(220, Math.max(160, w - 48));
    this.barInner = this.barWidth - 8;
    this.barTrack.setSize(this.barWidth, 10);
    this.barFill.setSize(this.barInner, 6);
    this.hint.setPosition(w / 2, safe.top + 14);
    this.barTrack.setPosition(w / 2, safe.top + 42);
    this.barFill.setPosition(w / 2 - this.barInner / 2, safe.top + 42);
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

function energyColor(energy: number): number {
  if (energy > 0.35) {
    return 0x7ee8ff;
  }
  if (energy > 0.14) {
    return 0xf0c56a;
  }
  return 0xf08a8a;
}
