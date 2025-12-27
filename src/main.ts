import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.ts';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [GameScene],
  pixelArt: true,
};

new Phaser.Game(config);
