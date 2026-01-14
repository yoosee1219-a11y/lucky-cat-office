import Phaser from 'phaser';

export class Unit extends Phaser.GameObjects.Container {
  private circle: Phaser.GameObjects.Arc;
  private healthBar: Phaser.GameObjects.Graphics;
  public gridRow: number;
  public gridCol: number;
  public maxHealth: number = 5;
  public currentHealth: number = 5;
  public attackRange: number = 150;
  public attackDamage: number = 1;
  public attackCooldown: number = 1000; // ms
  private lastAttackTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, row: number, col: number) {
    super(scene, x, y);

    this.gridRow = row;
    this.gridCol = col;

    // 유닛 원 생성 (파란색 = 아군)
    this.circle = scene.add.arc(0, 0, 25, 0, 360, false, 0x4a90e2);
    this.circle.setStrokeStyle(3, 0x2c5aa0);
    this.add(this.circle);

    // 레벨/등급 표시
    const levelText = scene.add.text(0, 0, '1', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(levelText);

    // 체력바 그래픽
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();

    scene.add.existing(this);
  }

  public takeDamage(amount: number): void {
    this.currentHealth -= amount;
    if (this.currentHealth < 0) this.currentHealth = 0;
    this.updateHealthBar();

    // 피격 효과 (빨간색 깜빡임)
    this.scene.tweens.add({
      targets: this.circle,
      fillColor: 0xff0000,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.circle.fillColor = 0x4a90e2;
      },
    });

    if (this.currentHealth <= 0) {
      this.destroy();
    }
  }

  private updateHealthBar(): void {
    this.healthBar.clear();

    const barWidth = 40;
    const barHeight = 4;
    const barX = -barWidth / 2;
    const barY = -35;

    // 배경 (빨간색)
    this.healthBar.fillStyle(0xff0000, 1);
    this.healthBar.fillRect(barX, barY, barWidth, barHeight);

    // 현재 체력 (녹색)
    const healthPercent = this.currentHealth / this.maxHealth;
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }

  public canAttack(): boolean {
    const currentTime = this.scene.time.now;
    return currentTime - this.lastAttackTime >= this.attackCooldown;
  }

  public attack(_target: Phaser.GameObjects.GameObject): void {
    this.lastAttackTime = this.scene.time.now;

    // 투사체 발사 (나중에 구현)
    console.log('Unit attacks!');
  }
}
