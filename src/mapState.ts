export type MapSnap = {
  shipX: number;
  shipY: number;
  clayX: number;
  clayY: number;
  iceX: number;
  iceY: number;
};

const snap: MapSnap = {
  shipX: 0,
  shipY: 0,
  clayX: 0,
  clayY: 0,
  iceX: 0,
  iceY: 0,
};

export function setMapSnap(next: MapSnap): void {
  snap.shipX = next.shipX;
  snap.shipY = next.shipY;
  snap.clayX = next.clayX;
  snap.clayY = next.clayY;
  snap.iceX = next.iceX;
  snap.iceY = next.iceY;
}

export function getMapSnap(): MapSnap {
  return snap;
}
