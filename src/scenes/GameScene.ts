import Phaser from 'phaser';
import { GRID_CONFIG, COLORS, GAME_CONFIG, ENEMY_PATH, gridToScreen } from '../config/gameConfig';
import { Unit } from '../entities/Unit';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';

export class GameScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private units: Unit[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private occupiedCells: Set<string> = new Set();
  private hqHealth: number = GAME_CONFIG.hqMaxHealth;
  private hqHealthText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  create() {
    // 배경색 설정
    this.cameras.main.setBackgroundColor(COLORS.gridCell);

    // 그래픽 객체 생성
    this.gridGraphics = this.add.graphics();

    // 5x5 그리드 렌더링
    this.renderGrid();

    // 터치/클릭 이벤트 리스너
    this.input.on('pointerdown', this.handlePointerDown, this);

    // 디버그 정보 표시
    this.add.text(10, 10, '운빨냥사원 - MVP v0.3', {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'Arial',
    });

    // HQ 체력 표시
    this.hqHealthText = this.add.text(10, 35, `HQ 체력: ${this.hqHealth}/${GAME_CONFIG.hqMaxHealth}`, {
      fontSize: '16px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });

    // 하단 설명
    this.add.text(195, 800, '유닛 배치하고 적을 막으세요!', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // 웨이브 시스템: 3초마다 적 생성
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
  }

  update(_time: number, delta: number): void {
    // 적 업데이트
    for (const enemy of this.enemies) {
      if (!enemy.isDead && !enemy.reachedEnd) {
        enemy.update(delta);

        // HQ 도달 확인
        if (enemy.reachedEnd) {
          this.onEnemyReachedHQ();
          enemy.destroy();
        }
      }
    }

    // 유닛 자동 공격
    for (const unit of this.units) {
      if (unit.canAttack()) {
        const target = unit.findNearestEnemy(this.enemies);
        if (target) {
          const projectile = unit.attack(target);
          this.projectiles.push(projectile);
        }
      }
    }

    // 투사체 업데이트
    for (const projectile of this.projectiles) {
      if (projectile.active) {
        projectile.update(delta);
      }
    }

    // 죽은 적 제거
    this.enemies = this.enemies.filter(e => e.active);

    // 파괴된 투사체 제거
    this.projectiles = this.projectiles.filter(p => p.active);
  }

  private renderGrid(): void {
    const { rows, cols, cellSize, hqPosition } = GRID_CONFIG;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const { x, y } = gridToScreen(row, col);

        // 중앙 본사인지 확인
        const isHQ = row === hqPosition.row && col === hqPosition.col;

        // 셀 그리기
        this.gridGraphics.fillStyle(isHQ ? COLORS.hqCell : 0xffffff, 1);
        this.gridGraphics.fillRect(x, y, cellSize, cellSize);

        // 테두리 그리기
        this.gridGraphics.lineStyle(2, COLORS.gridLine, 1);
        this.gridGraphics.strokeRect(x, y, cellSize, cellSize);

        // HQ 텍스트 표시
        if (isHQ) {
          this.add.text(x + cellSize / 2, y + cellSize / 2, 'HQ', {
            fontSize: '20px',
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'bold',
          }).setOrigin(0.5);
        }

        // 디버그: 좌표 표시
        this.add.text(x + 5, y + 5, `${row},${col}`, {
          fontSize: '10px',
          color: '#999999',
          fontFamily: 'Arial',
        });
      }
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const { x, y } = pointer;

    // 그리드 좌표로 변환
    const gridPos = this.screenToGrid(x, y);

    if (gridPos) {
      const { row, col } = gridPos;
      const cellKey = `${row},${col}`;

      // HQ 셀인지 확인
      const isHQ = row === GRID_CONFIG.hqPosition.row && col === GRID_CONFIG.hqPosition.col;
      if (isHQ) {
        console.log('HQ 셀에는 유닛 배치 불가');
        return;
      }

      // 이미 유닛이 있는지 확인
      if (this.occupiedCells.has(cellKey)) {
        console.log('이미 유닛이 있는 셀');
        return;
      }

      // 유닛 배치
      this.placeUnit(row, col);
    }
  }

  private placeUnit(row: number, col: number): void {
    const screenPos = gridToScreen(row, col);
    const centerX = screenPos.x + GRID_CONFIG.cellSize / 2;
    const centerY = screenPos.y + GRID_CONFIG.cellSize / 2;

    // 유닛 생성
    const unit = new Unit(this, centerX, centerY, row, col);
    this.units.push(unit);

    // 셀 점유 표시
    const cellKey = `${row},${col}`;
    this.occupiedCells.add(cellKey);

    console.log(`유닛 배치: (${row}, ${col}), 총 유닛 수: ${this.units.length}`);
  }

  private spawnEnemy(): void {
    // 경로 기반으로 적 생성
    const enemy = new Enemy(this, ENEMY_PATH);
    this.enemies.push(enemy);

    console.log(`적 생성! 현재 적 수: ${this.enemies.length}`);
  }

  private onEnemyReachedHQ(): void {
    // HQ 체력 감소
    this.hqHealth--;
    this.hqHealthText.setText(`HQ 체력: ${this.hqHealth}/${GAME_CONFIG.hqMaxHealth}`);

    console.log(`적이 HQ 도달! 남은 체력: ${this.hqHealth}`);

    // 게임 오버 확인
    if (this.hqHealth <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    console.log('GAME OVER!');

    // 게임 일시정지
    this.scene.pause();

    // 게임 오버 텍스트 표시
    const gameOverText = this.add.text(195, 400, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    gameOverText.setDepth(1000);

    // 재시작 버튼
    const restartText = this.add.text(195, 480, '다시 시작 (클릭)', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive();

    restartText.setDepth(1000);

    restartText.on('pointerdown', () => {
      this.scene.restart();
    });
  }

  private screenToGrid(x: number, y: number): { row: number; col: number } | null {
    const col = Math.floor((x - GRID_CONFIG.startX) / (GRID_CONFIG.cellSize + GRID_CONFIG.padding));
    const row = Math.floor((y - GRID_CONFIG.startY) / (GRID_CONFIG.cellSize + GRID_CONFIG.padding));

    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      return { row, col };
    }
    return null;
  }
}
