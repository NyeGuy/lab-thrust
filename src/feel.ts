/** Tuned feel knobs. Numbers are the product for v0. */

export const FEEL = {
  /** Full-stick thrust acceleration, px/s². */
  thrustAccel: 580,
  /** Hard speed cap, px/s. */
  maxSpeed: 340,
  /** Linear drag, px/s². Light so a release still coasts. */
  drag: 42,
  /** Stick magnitude below this is treated as released (0–1). */
  stickDeadzone: 0.14,
  /** Slight ease so the first third of the stick is finer. */
  stickExponent: 1.12,
  /** On-screen stick radius in CSS pixels. */
  stickRadius: 70,
  /** Extra grab padding around the ring. */
  stickHitPad: 28,
  /** How fast the nose turns toward thrust, rad/s. */
  turnRateThrust: 10,
  /** How fast the nose eases toward velocity while coasting, rad/s. */
  turnRateCoast: 3.6,
  /** Skip facing updates below this speed when not thrusting. */
  faceMinSpeed: 28,
  /** Camera follow lerp (0–1 per frame-ish Phaser lerp). */
  cameraLerp: 0.09,
  /** Extra camera lead along velocity, in px at max speed. */
  cameraLookAhead: 72,
  /** Soft planet gravity cap so the stick always wins, px/s². */
  gravityCap: 88,
  /** Planet gravity mass scale (accel = mass / dist², then capped). */
  gravityMass: 2_400_000,
  /** Gravity falls off past this range. */
  gravityRange: 520,
  /** Arcade bounce against planet circles. */
  bounce: 0.72,
} as const;

export type StickSample = {
  x: number;
  y: number;
  magnitude: number;
  active: boolean;
};

export const idleStick: StickSample = {
  x: 0,
  y: 0,
  magnitude: 0,
  active: false,
};

/** Remap raw 0–1 stick length through deadzone + exponent. */
export function remapStick(raw: number): number {
  if (raw <= FEEL.stickDeadzone) {
    return 0;
  }
  const spanned = (raw - FEEL.stickDeadzone) / (1 - FEEL.stickDeadzone);
  return Math.min(1, spanned) ** FEEL.stickExponent;
}

export function readSafeInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string): number => {
    const raw = css.getPropertyValue(name).trim();
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    top: read("--safe-top"),
    right: read("--safe-right"),
    bottom: read("--safe-bottom"),
    left: read("--safe-left"),
  };
}
