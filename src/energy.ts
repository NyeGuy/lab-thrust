import { FEEL } from "./feel";

let energy: number = FEEL.energyMax;

export function getEnergy(): number {
  return energy;
}

export function resetEnergy(): void {
  energy = FEEL.energyMax;
}

/**
 * Drain while burning, regen while not. Returns whether this frame may apply thrust.
 * Holding an empty stick does not burn and still regenerates — you have to let the tank sip.
 */
export function tickEnergy(dt: number, wantThrust: boolean, magnitude: number): boolean {
  const canBurn = wantThrust && energy > 0 && magnitude > 0;
  if (canBurn) {
    energy = Math.max(0, energy - FEEL.energyDrainPerSec * magnitude * dt);
    return true;
  }
  energy = Math.min(FEEL.energyMax, energy + FEEL.energyRegenPerSec * dt);
  return false;
}
