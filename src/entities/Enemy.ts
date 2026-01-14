import Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Container {
  private circle: Phaser.GameObjects.Arc;
  private healthBar: Phaser.GameObjects.Graphics;
  public maxHealth: number = 3;
  public currentHealth: number = 3;
  public moveSpeed: number = 30; // pixels per second
  public targetX: number;
  public targetY: number;
  public isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number) {
    super(scene, x, y);

    this.targetX = targetX;
    this.targetY = targetY;

    // 적 원 생성 (빨간색)
    this.circle = scene.add.arc(0, 0, 20, 0, 360, false, 0xff4444);
    this.circle.setStrokeStyle(3, 0xaa0000);
    this.add(this.circle);

    // 눈 표시 (귀여운 몬스터)
    const leftEye = scene.add.circle(-8, -5, 3, 0x000000);
    const rightEye = scene.add.circle(8, -5, 3, 0x000000);
    this.add(leftEye);
    this.add(rightEye);

    // 체력바 그래픽
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();

    scene.add.existing(this);
  }

  update(delta: number): void {
    if (this.isDead) return;

    // HQ를 향해 이동
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      // 정규화된 방향
      const dirX = dx / distance;
      const dirY = dy / distance;

      // 이동
      const moveDistance = (this.moveSpeed * delta) / 1000;
      this.x += dirX * moveDistance;
      this.y += dirY * moveDistance;
    }
  }

  public takeDamage(amount: number): void {
    if (this.isDead) return;

    this.currentHealth -= amount;
    if (this.currentHealth < 0) this.currentHealth = 0;
    this.updateHealthBar();

    // 피격 효과 (흰색 깜빡임)
    this.scene.tweens.add({
      targets: this.circle,
      fillColor: 0xffffff,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.circle.fillColor = 0xff4444;
      },
    });

    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.isDead = true;

    // 사망 애니메이션 (페이드아웃 + 축소)
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  private updateHealthBar(): void {
    this.healthBar.clear();

    const barWidth = 40;
    const barHeight = 4;
    const barX = -barWidth / 2;
    const barY = -30;

    // 배경 (빨간색)
    this.healthBar.fillStyle(0x880000, 1);
    this.healthBar.fillRect(barX, barY, barWidth, barHeight);

    // 현재 체력 (노란색)
    const healthPercent = this.currentHealth / this.maxHealth;
    this.healthBar.fillStyle(0xffff00, 1);
    this.healthBar.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }

  public reachedTarget(): boolean {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 30; // HQ 반경
  }
}
