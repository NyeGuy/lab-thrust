export type DockMode = "hidden" | "dock" | "undock";

let mode: DockMode = "hidden";
let queued = false;

export function setDockMode(next: DockMode): void {
  mode = next;
}

export function getDockMode(): DockMode {
  return mode;
}

export function requestDockAction(): void {
  if (mode === "hidden") {
    return;
  }
  queued = true;
}

export function consumeDockAction(): boolean {
  const hit = queued;
  queued = false;
  return hit;
}

export function resetDock(): void {
  mode = "hidden";
  queued = false;
}
