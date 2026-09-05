import Phaser from "phaser";
import { HudScene } from "./scenes/HudScene";
import { PlayScene } from "./scenes/PlayScene";

const prevent = (event: Event): void => {
  event.preventDefault();
};

window.addEventListener("contextmenu", prevent);
window.addEventListener("touchmove", prevent, { passive: false });

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#07080d",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    autoRound: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      fps: 60,
      fixedStep: true,
      debug: false,
    },
  },
  input: {
    activePointers: 2,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  audio: {
    noAudio: true,
  },
  scene: [PlayScene, HudScene],
};

new Phaser.Game(config);
