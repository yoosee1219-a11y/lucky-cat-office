import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { GAME_CONFIG } from './config/gameConfig';
import './index.css';

// Phaser 게임 설정
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.backgroundColor,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  fps: {
    target: 30, // 배터리 절약
    forceSetTimeOut: true,
  },
  scene: [GameScene],
};

// 게임 인스턴스 생성
new Phaser.Game(config);

console.log('운빨냥사원 게임 시작!');
