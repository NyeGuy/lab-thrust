/** Tuned feel knobs. Numbers are the product for v0. */

export const FEEL = {
  /** Full-stick thrust acceleration, px/s². Softer than the first pass. */
  thrustAccel: 340,
  /** Hard speed cap, px/s. */
  maxSpeed: 300,
  /** Linear drag, px/s². Low so a burn still coasts and you can adjust mid-path. */
  drag: 14,
  /** Stick magnitude below this is treated as released (0–1). */
  stickDeadzone: 0.18,
  /** Ease so light stick pressure stays fine (less twitch). */
  stickExponent: 1.4,
  /** On-screen stick radius in CSS pixels. */
  stickRadius: 70,
  /** Extra grab padding around the ring. */
  stickHitPad: 28,
  /** How fast the nose turns toward thrust, rad/s. */
  turnRateThrust: 6.8,
  /** How fast the nose eases toward velocity while coasting, rad/s. */
  turnRateCoast: 2.4,
  /** Skip facing updates below this speed when not thrusting. */
  faceMinSpeed: 22,
  /** Camera follow lerp (0–1 per frame-ish Phaser lerp). */
  cameraLerp: 0.07,
  /** Extra camera lead along velocity, in px at max speed. */
  cameraLookAhead: 88,
  /** Soft planet gravity cap so the stick always wins, px/s². */
  gravityCap: 70,
  /** Planet gravity mass scale (accel = mass / dist², then capped). */
  gravityMass: 2_200_000,
  /** Gravity falls off past this range. */
  gravityRange: 520,
  /** Arcade bounce against planet circles. */
  bounce: 0.68,
  /** Full tank. */
  energyMax: 1,
  /** Full-stick drain per second. Empty in ~2.5s of hard burn. */
  energyDrainPerSec: 0.4,
  /** Regen per second while not burning. Full tank in ~6.5s. */
  energyRegenPerSec: 0.155,
  /** Camera zoom so a phone still sees the sun + a planet. */
  cameraZoom: 0.76,
  /** Sun disc radius (collision + gravity body). */
  sunRadius: 118,
  /** Sun gravity mass / cap / range. Stick still wins. */
  sunGravityMass: 5_200_000,
  sunGravityCap: 52,
  sunGravityRange: 1400,
  /** Extra reach past a planet surface to offer dock. */
  dockRange: 44,
  /** Sit this far outside the collision radius when parked. */
  dockPad: 18,
  /** Outward kick on undock, px/s. */
  undockImpulse: 110,
  /** Seconds before a new dock is offered after undock. */
  undockCooldown: 0.55,
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
