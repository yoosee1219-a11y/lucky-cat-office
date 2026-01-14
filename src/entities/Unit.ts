import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';

export class Unit extends Phaser.GameObjects.Container {
  private circle: Phaser.GameObjects.Arc;
  public gridRow: number;
  public gridCol: number;
  public attackRange: number = 150;
  public attackDamage: number = 1;
  public attackCooldown: number = 1000; // ms
  private lastAttackTime: number = 0;
  public level: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, row: number, col: number) {
    super(scene, x, y);

    this.gridRow = row;
    this.gridCol = col;

    // 유닛 원 생성 (파란색 = 아군)
    this.circle = scene.add.arc(0, 0, 25, 0, 360, false, 0x4a90e2);
    this.circle.setStrokeStyle(3, 0x2c5aa0);
    this.add(this.circle);

    // 레벨/등급 표시
    const levelText = scene.add.text(0, 0, this.level.toString(), {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(levelText);

    scene.add.existing(this);
  }

  public canAttack(): boolean {
    const currentTime = this.scene.time.now;
    return currentTime - this.lastAttackTime >= this.attackCooldown;
  }

  public attack(target: Enemy): Projectile {
    this.lastAttackTime = this.scene.time.now;

    // 투사체 생성 및 발사
    const projectile = new Projectile(this.scene, this.x, this.y, target, this.attackDamage);

    return projectile;
  }

  public findNearestEnemy(enemies: Enemy[]): Enemy | null {
    let nearest: Enemy | null = null;
    let minDistance = this.attackRange;

    for (const enemy of enemies) {
      if (enemy.isDead || !enemy.active) continue;

      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }

    return nearest;
  }
}
