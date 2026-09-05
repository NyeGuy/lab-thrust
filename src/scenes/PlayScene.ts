import Phaser from "phaser";
import { consumeDockAction, resetDock, setDockMode } from "../dock";
import { resetEnergy, tickEnergy } from "../energy";
import { FEEL } from "../feel";
import { getStick } from "../input/stickState";
import { createTextures } from "../textures";

type Planet = {
  sprite: Phaser.Physics.Arcade.Image;
  radius: number;
  orbit: number;
  angle: number;
  spin: number;
};

export class PlayScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Sprite;
  private flame!: Phaser.GameObjects.Image;
  private sun!: Phaser.Physics.Arcade.Image;
  private planets: Planet[] = [];
  private starsFar!: Phaser.GameObjects.TileSprite;
  private starsNear!: Phaser.GameObjects.TileSprite;
  private docked: Planet | null = null;
  private dockAngle = 0;
  private undockBan = 0;
  private inRange: Planet | null = null;

  constructor() {
    super({ key: "play" });
  }

  preload(): void {
    createTextures(this);
  }

  create(): void {
    this.starsFar = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "stars-far")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-20);
    this.starsNear = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "stars-near")
      .setOrigin(0)
      .setScrollFactor(0)
      .setAlpha(0.85)
      .setDepth(-19);

    const rings = this.add.graphics();
    rings.lineStyle(1, 0xffffff, 0.08);
    rings.strokeCircle(0, 0, 560);
    rings.strokeCircle(0, 0, 900);
    rings.setDepth(-10);

    this.sun = this.physics.add.staticImage(0, 0, "sun");
    this.sun.setCircle(
      FEEL.sunRadius,
      this.sun.width / 2 - FEEL.sunRadius,
      this.sun.height / 2 - FEEL.sunRadius,
    );
    this.sun.refreshBody();
    this.sun.setDepth(0);

    this.addPlanet("planet-clay", 170, 560, 0.35, 0.11);
    this.addPlanet("planet-ice", 146, 900, 3.5, 0.065);

    const inner = this.planets[0];
    if (!inner) {
      throw new Error("inner planet missing");
    }
    const inward = Math.atan2(-inner.sprite.y, -inner.sprite.x);
    this.ship = this.physics.add.sprite(
      inner.sprite.x + Math.cos(inward) * (inner.radius + 90),
      inner.sprite.y + Math.sin(inward) * (inner.radius + 90),
      "ship",
    );
    this.ship.setDepth(2);
    this.ship.setCircle(13, 19, 19);
    this.ship.setDamping(false);
    this.ship.setDrag(FEEL.drag, FEEL.drag);
    this.ship.setMaxVelocity(FEEL.maxSpeed, FEEL.maxSpeed);
    this.ship.setBounce(FEEL.bounce);
    this.ship.setCollideWorldBounds(false);

    this.flame = this.add.image(this.ship.x, this.ship.y, "flame");
    this.flame.setDepth(1);
    this.flame.setAlpha(0);

    this.physics.add.collider(this.ship, this.sun);
    for (const planet of this.planets) {
      this.physics.add.collider(this.ship, planet.sprite);
    }

    this.cameras.main.startFollow(this.ship, false, FEEL.cameraLerp, FEEL.cameraLerp);
    this.cameras.main.setBackgroundColor(0x07080d);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(FEEL.cameraZoom);

    resetEnergy();
    resetDock();
    this.scale.on("resize", this.onResize, this);
    this.scene.launch("hud");

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.onResize, this);
    });
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 32) / 1000;
    this.undockBan = Math.max(0, this.undockBan - dt);
    this.stepOrbits(dt);
    this.sun.setScale(1 + 0.012 * Math.sin(_time * 0.002));

    if (this.docked) {
      this.holdOnPlanet(this.docked);
      tickEnergy(dt, false, 0);
      this.flame.setAlpha(0);
      setDockMode("undock");
      if (consumeDockAction()) {
        this.undock();
      }
      this.syncCamera(0, 0);
      this.parallax();
      return;
    }

    const body = this.ship.body;
    if (!body) {
      return;
    }

    const stick = getStick();
    const wantThrust = stick.magnitude > 0;
    const burning = tickEnergy(dt, wantThrust, stick.magnitude);

    let ax = burning ? stick.x * FEEL.thrustAccel : 0;
    let ay = burning ? stick.y * FEEL.thrustAccel : 0;

    const sdx = -this.ship.x;
    const sdy = -this.ship.y;
    const sunDist = Math.hypot(sdx, sdy);
    if (sunDist > 1 && sunDist < FEEL.sunGravityRange) {
      const g = Math.min(FEEL.sunGravityMass / (sunDist * sunDist), FEEL.sunGravityCap);
      ax += (sdx / sunDist) * g;
      ay += (sdy / sunDist) * g;
    }

    for (const planet of this.planets) {
      const dx = planet.sprite.x - this.ship.x;
      const dy = planet.sprite.y - this.ship.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1 || dist > FEEL.gravityRange) {
        continue;
      }
      const accel = Math.min(FEEL.gravityMass / (dist * dist), FEEL.gravityCap);
      ax += (dx / dist) * accel;
      ay += (dy / dist) * accel;
    }

    this.ship.setAcceleration(ax, ay);

    const vx = body.velocity.x;
    const vy = body.velocity.y;
    const speed = Math.hypot(vx, vy);
    const target = burning ? Math.atan2(stick.y, stick.x) : Math.atan2(vy, vx);
    if (burning || speed > FEEL.faceMinSpeed) {
      const rate = burning ? FEEL.turnRateThrust : FEEL.turnRateCoast;
      this.ship.rotation = Phaser.Math.Angle.RotateTo(this.ship.rotation, target, rate * dt);
    }

    this.flame.setPosition(this.ship.x, this.ship.y);
    this.flame.setRotation(this.ship.rotation);
    if (burning) {
      const pulse = 0.55 + 0.45 * stick.magnitude;
      this.flame.setAlpha(0.35 + 0.55 * stick.magnitude);
      this.flame.setScale(0.7 + 0.7 * stick.magnitude, pulse);
    } else {
      this.flame.setAlpha(0);
    }

    this.refreshDockRange();
    if (this.inRange) {
      setDockMode("dock");
      if (consumeDockAction()) {
        this.dockTo(this.inRange);
      }
    } else {
      setDockMode("hidden");
      consumeDockAction();
    }

    this.syncCamera(vx, vy);
    this.parallax();
  }

  private stepOrbits(dt: number): void {
    for (const planet of this.planets) {
      planet.angle += planet.spin * dt;
      const x = Math.cos(planet.angle) * planet.orbit;
      const y = Math.sin(planet.angle) * planet.orbit;
      planet.sprite.setPosition(x, y);
      planet.sprite.body?.reset(x, y);
    }
  }

  private refreshDockRange(): void {
    if (this.undockBan > 0) {
      this.inRange = null;
      return;
    }
    let best: Planet | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const planet of this.planets) {
      const dist = Math.hypot(planet.sprite.x - this.ship.x, planet.sprite.y - this.ship.y);
      if (dist <= planet.radius + FEEL.dockRange && dist < bestDist) {
        best = planet;
        bestDist = dist;
      }
    }
    this.inRange = best;
  }

  private dockTo(planet: Planet): void {
    this.docked = planet;
    this.dockAngle = Math.atan2(this.ship.y - planet.sprite.y, this.ship.x - planet.sprite.x);
    this.ship.setAcceleration(0, 0);
    this.ship.setVelocity(0, 0);
    this.ship.body?.stop();
    if (this.ship.body) {
      this.ship.body.enable = false;
    }
    this.holdOnPlanet(planet);
  }

  private holdOnPlanet(planet: Planet): void {
    const reach = planet.radius + FEEL.dockPad;
    const x = planet.sprite.x + Math.cos(this.dockAngle) * reach;
    const y = planet.sprite.y + Math.sin(this.dockAngle) * reach;
    this.ship.setPosition(x, y);
    this.ship.setRotation(this.dockAngle);
    this.flame.setPosition(x, y);
    this.flame.setRotation(this.dockAngle);
  }

  private undock(): void {
    const planet = this.docked;
    this.docked = null;
    this.inRange = null;
    this.undockBan = FEEL.undockCooldown;
    if (this.ship.body) {
      this.ship.body.enable = true;
    }
    this.ship.setAcceleration(0, 0);
    if (planet) {
      this.ship.setVelocity(
        Math.cos(this.dockAngle) * FEEL.undockImpulse,
        Math.sin(this.dockAngle) * FEEL.undockImpulse,
      );
    }
    setDockMode("hidden");
  }

  private syncCamera(vx: number, vy: number): void {
    const lead = FEEL.cameraLookAhead / FEEL.maxSpeed;
    this.cameras.main.setFollowOffset(-vx * lead, -vy * lead);
  }

  private parallax(): void {
    const cam = this.cameras.main;
    this.starsFar.tilePositionX = cam.scrollX * 0.12;
    this.starsFar.tilePositionY = cam.scrollY * 0.12;
    this.starsNear.tilePositionX = cam.scrollX * 0.28;
    this.starsNear.tilePositionY = cam.scrollY * 0.28;
  }

  private onResize = (gameSize: Phaser.Structs.Size): void => {
    this.starsFar.setSize(gameSize.width, gameSize.height);
    this.starsNear.setSize(gameSize.width, gameSize.height);
  };

  private addPlanet(
    key: string,
    radius: number,
    orbit: number,
    angle: number,
    spin: number,
  ): void {
    const x = Math.cos(angle) * orbit;
    const y = Math.sin(angle) * orbit;
    const sprite = this.physics.add.image(x, y, key);
    sprite.setImmovable(true);
    sprite.setCircle(radius, sprite.width / 2 - radius, sprite.height / 2 - radius);
    sprite.setDepth(0);
    if (sprite.body) {
      sprite.body.allowGravity = false;
      sprite.body.moves = false;
    }
    this.planets.push({ sprite, radius, orbit, angle, spin });
  }
}
