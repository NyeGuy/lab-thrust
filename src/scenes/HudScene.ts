import Phaser from "phaser";
import { FEEL, remapStick, readSafeInsets, idleStick } from "../feel";
import { setStick } from "../input/stickState";

export class HudScene extends Phaser.Scene {
  private ring!: Phaser.GameObjects.Arc;
  private knob!: Phaser.GameObjects.Arc;
  private hint!: Phaser.GameObjects.Text;
  private pointerId: number | null = null;
  private originX = 0;
  private originY = 0;
  private hintFading = false;

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
    this.hint.setPosition(w / 2, safe.top + 18);
    if (this.pointerId === null) {
      setStick(idleStick);
    }
  };

  private onDown = (pointer: Phaser.Input.Pointer): void => {
    if (this.pointerId !== null) {
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
