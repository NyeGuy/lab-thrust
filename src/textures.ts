import Phaser from "phaser";

function fillCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function addCanvas(
  scene: Phaser.Scene,
  key: string,
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
): void {
  const canvas = scene.textures.createCanvas(key, size, size);
  if (!canvas) {
    throw new Error(`Could not create texture ${key}`);
  }
  const ctx = canvas.getContext();
  draw(ctx, size);
  canvas.refresh();
}

export function createTextures(scene: Phaser.Scene): void {
  addCanvas(scene, "ship", 64, (ctx, size) => {
    const cx = size / 2;
    const cy = size / 2;
    ctx.translate(cx, cy);
    ctx.shadowColor = "rgba(94, 224, 200, 0.55)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-16, 13);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-16, -13);
    ctx.closePath();
    ctx.fillStyle = "#d7fff4";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-8, 7);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, -7);
    ctx.closePath();
    ctx.fillStyle = "#2a3a44";
    ctx.fill();
    fillCircle(ctx, 6, 0, 3.2, "#7ee8ff");
  });

  addCanvas(scene, "flame", 48, (ctx, size) => {
    ctx.translate(size / 2, size / 2);
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-22, 7);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-22, -7);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 176, 96, 0.92)";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-16, 3.5);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-16, -3.5);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 244, 210, 0.95)";
    ctx.fill();
  });

  addPlanet(scene, "planet-clay", 380, ["#3a2218", "#c47a4a", "#e8c39a"]);
  addPlanet(scene, "planet-ice", 330, ["#1c2a36", "#7aa0b8", "#d7e8f2"]);
  addSun(scene, "sun", 280);

  addStars(scene, "stars-far", 512, 70, 1.1);
  addStars(scene, "stars-near", 512, 36, 1.8);
}

function addSun(scene: Phaser.Scene, key: string, size: number): void {
  addCanvas(scene, key, size, (ctx, s) => {
    const c = s / 2;
    const r = s / 2 - 8;
    const corona = ctx.createRadialGradient(c, c, r * 0.28, c, c, r);
    corona.addColorStop(0, "rgba(255, 244, 210, 1)");
    corona.addColorStop(0.35, "rgba(255, 196, 92, 0.95)");
    corona.addColorStop(0.7, "rgba(255, 140, 48, 0.35)");
    corona.addColorStop(1, "rgba(255, 120, 40, 0)");
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();
    const core = ctx.createRadialGradient(c - r * 0.12, c - r * 0.14, 4, c, c, r * 0.42);
    core.addColorStop(0, "#fff8e6");
    core.addColorStop(1, "#ffb24a");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(c, c, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
  });
}

function addPlanet(scene: Phaser.Scene, key: string, size: number, stops: string[]): void {
  addCanvas(scene, key, size, (ctx, s) => {
    const c = s / 2;
    const r = s / 2 - 6;
    const glow = ctx.createRadialGradient(c, c, r * 0.7, c, c, r + 6);
    glow.addColorStop(0, "rgba(180, 200, 220, 0)");
    glow.addColorStop(1, "rgba(180, 200, 220, 0.18)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(c, c, r + 6, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createRadialGradient(c - r * 0.28, c - r * 0.3, r * 0.12, c, c, r);
    body.addColorStop(0, stops[2] ?? "#fff");
    body.addColorStop(0.45, stops[1] ?? "#888");
    body.addColorStop(1, stops[0] ?? "#222");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = stops[0] ?? "#000";
    ctx.beginPath();
    ctx.ellipse(c + r * 0.18, c + r * 0.12, r * 0.34, r * 0.2, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c - r * 0.22, c + r * 0.28, r * 0.16, r * 0.12, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function addStars(
  scene: Phaser.Scene,
  key: string,
  size: number,
  count: number,
  scale: number,
): void {
  addCanvas(scene, key, size, (ctx, s) => {
    for (let i = 0; i < count; i += 1) {
      const x = (Math.sin(i * 12.9898 + s) * 43758.5453) % 1;
      const y = (Math.sin(i * 78.233 + s) * 23421.631) % 1;
      const px = Math.abs(x) * s;
      const py = Math.abs(y) * s;
      const bright = 0.35 + ((i * 17) % 65) / 100;
      const r = (0.4 + ((i * 13) % 10) / 14) * scale;
      fillCircle(ctx, px, py, r, `rgba(226, 234, 246, ${bright})`);
    }
  });
}
