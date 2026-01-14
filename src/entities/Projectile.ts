import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Projectile extends Phaser.GameObjects.Arc {
  private target: Enemy;
  private speed: number = 200; // pixels per second
  private damage: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number = 1) {
    super(scene, x, y, 5, 0, 360, false, 0xffff00);

    this.target = target;
    this.damage = damage;
    this.setStrokeStyle(1, 0xffaa00);

    scene.add.existing(this);
  }

  update(delta: number): void {
    // 타겟이 죽었거나 없으면 투사체 제거
    if (!this.target || !this.target.active || this.target.isDead) {
      this.destroy();
      return;
    }

    // 타겟 방향으로 이동
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 타겟에 도달했는지 확인
    if (distance < 10) {
      // 데미지 입히고 제거
      this.target.takeDamage(this.damage);
      this.destroy();
      return;
    }

    // 정규화된 방향으로 이동
    const dirX = dx / distance;
    const dirY = dy / distance;
    const moveDistance = (this.speed * delta) / 1000;

    this.x += dirX * moveDistance;
    this.y += dirY * moveDistance;
  }
}
