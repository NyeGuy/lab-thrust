import Phaser from "phaser";
import { FEEL } from "../feel";
import { getStick } from "../input/stickState";
import { createTextures } from "../textures";

type Planet = {
  sprite: Phaser.Physics.Arcade.Image;
};

export class PlayScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Sprite;
  private flame!: Phaser.GameObjects.Image;
  private planets: Planet[] = [];
  private starsFar!: Phaser.GameObjects.TileSprite;
  private starsNear!: Phaser.GameObjects.TileSprite;

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

    this.placePlanet(-220, -40, "planet-clay", 96);
    this.placePlanet(430, 210, "planet-ice", 58);
    this.placePlanet(80, -360, "planet-wine", 74);

    this.ship = this.physics.add.sprite(40, 80, "ship");
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

    for (const planet of this.planets) {
      this.physics.add.collider(this.ship, planet.sprite);
    }

    this.cameras.main.startFollow(this.ship, false, FEEL.cameraLerp, FEEL.cameraLerp);
    this.cameras.main.setBackgroundColor(0x07080d);
    this.cameras.main.setRoundPixels(true);

    this.scale.on("resize", this.onResize, this);
    this.scene.launch("hud");

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.onResize, this);
    });
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 32) / 1000;
    const stick = getStick();
    const body = this.ship.body;
    if (!body) {
      return;
    }

    let ax = stick.x * FEEL.thrustAccel;
    let ay = stick.y * FEEL.thrustAccel;

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
    const thrusting = stick.magnitude > 0;
    const target = thrusting
      ? Math.atan2(stick.y, stick.x)
      : Math.atan2(vy, vx);
    const shouldFace = thrusting || speed > FEEL.faceMinSpeed;
    if (shouldFace) {
      const rate = thrusting ? FEEL.turnRateThrust : FEEL.turnRateCoast;
      this.ship.rotation = Phaser.Math.Angle.RotateTo(this.ship.rotation, target, rate * dt);
    }

    this.flame.setPosition(this.ship.x, this.ship.y);
    this.flame.setRotation(this.ship.rotation);
    if (thrusting) {
      const pulse = 0.55 + 0.45 * stick.magnitude;
      this.flame.setAlpha(0.35 + 0.55 * stick.magnitude);
      this.flame.setScale(0.7 + 0.7 * stick.magnitude, pulse);
    } else {
      this.flame.setAlpha(0);
    }

    const cam = this.cameras.main;
    const lead = FEEL.cameraLookAhead / FEEL.maxSpeed;
    cam.setFollowOffset(-vx * lead, -vy * lead);

    this.starsFar.tilePositionX = cam.scrollX * 0.12;
    this.starsFar.tilePositionY = cam.scrollY * 0.12;
    this.starsNear.tilePositionX = cam.scrollX * 0.28;
    this.starsNear.tilePositionY = cam.scrollY * 0.28;
  }

  private onResize = (gameSize: Phaser.Structs.Size): void => {
    this.starsFar.setSize(gameSize.width, gameSize.height);
    this.starsNear.setSize(gameSize.width, gameSize.height);
  };

  private placePlanet(x: number, y: number, key: string, radius: number): void {
    const sprite = this.physics.add.staticImage(x, y, key);
    sprite.setCircle(radius, sprite.width / 2 - radius, sprite.height / 2 - radius);
    sprite.setDepth(0);
    this.planets.push({ sprite });
  }
}
