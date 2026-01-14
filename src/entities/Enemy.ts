import Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Container {
  private circle: Phaser.GameObjects.Arc;
  private healthBar: Phaser.GameObjects.Graphics;
  public maxHealth: number = 3;
  public currentHealth: number = 3;
  public moveSpeed: number = 50; // pixels per second
  private path: { x: number; y: number }[];
  private currentPathIndex: number = 0;
  public isDead: boolean = false;
  public reachedEnd: boolean = false;

  constructor(scene: Phaser.Scene, path: { x: number; y: number }[]) {
    // 경로의 첫 번째 지점에서 시작
    super(scene, path[0].x, path[0].y);

    this.path = path;
    this.currentPathIndex = 0;

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
    if (this.isDead || this.reachedEnd) return;

    // 다음 경로 지점이 있는지 확인
    if (this.currentPathIndex >= this.path.length) {
      // 경로 끝 도달 (HQ 도달)
      this.reachedEnd = true;
      return;
    }

    // 현재 목표 지점
    const target = this.path[this.currentPathIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 목표 지점에 가까워지면 다음 지점으로
    if (distance < 10) {
      this.currentPathIndex++;
      return;
    }

    // 목표 지점을 향해 이동
    const dirX = dx / distance;
    const dirY = dy / distance;
    const moveDistance = (this.moveSpeed * delta) / 1000;

    this.x += dirX * moveDistance;
    this.y += dirY * moveDistance;
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

}
