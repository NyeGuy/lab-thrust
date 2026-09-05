import { idleStick, type StickSample } from "../feel";

let sample: StickSample = idleStick;

export function setStick(next: StickSample): void {
  sample = next;
}

export function getStick(): StickSample {
  return sample;
}
