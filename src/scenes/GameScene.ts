import Phaser from 'phaser';
import { GRID_CONFIG, COLORS, gridToScreen } from '../config/gameConfig';
import { Unit } from '../entities/Unit';
import { Enemy } from '../entities/Enemy';

export class GameScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private units: Unit[] = [];
  private enemies: Enemy[] = [];
  private occupiedCells: Set<string> = new Set();
  private hqX: number = 0;
  private hqY: number = 0;

  constructor() {
    super('GameScene');
  }

  create() {
    // 배경색 설정
    this.cameras.main.setBackgroundColor(COLORS.gridCell);

    // 그래픽 객체 생성
    this.gridGraphics = this.add.graphics();

    // HQ 위치 계산
    const hqScreenPos = gridToScreen(GRID_CONFIG.hqPosition.row, GRID_CONFIG.hqPosition.col);
    this.hqX = hqScreenPos.x + GRID_CONFIG.cellSize / 2;
    this.hqY = hqScreenPos.y + GRID_CONFIG.cellSize / 2;

    // 5x5 그리드 렌더링
    this.renderGrid();

    // 터치/클릭 이벤트 리스너
    this.input.on('pointerdown', this.handlePointerDown, this);

    // 디버그 정보 표시
    this.add.text(10, 10, '운빨냥사원 - MVP v0.2', {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'Arial',
    });

    // 하단 설명
    this.add.text(195, 800, '유닛 배치하고 적을 막으세요!', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // 5초 후 적 생성
    this.time.delayedCall(5000, () => {
      this.spawnEnemy();
    });
  }

  update(_time: number, delta: number): void {
    // 적 업데이트
    for (const enemy of this.enemies) {
      if (!enemy.isDead) {
        enemy.update(delta);

        // HQ 도달 확인
        if (enemy.reachedTarget()) {
          console.log('적이 HQ에 도달! - GAME OVER');
          enemy.destroy();
        }
      }
    }

    // 죽은 적 제거
    this.enemies = this.enemies.filter(e => e.active);
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
    // 화면 오른쪽 끝에서 생성
    const startX = 390; // 화면 너비
    const startY = 400; // 중간 높이

    // HQ를 목표로 생성
    const enemy = new Enemy(this, startX, startY, this.hqX, this.hqY);
    this.enemies.push(enemy);

    console.log(`적 생성! HQ 목표: (${this.hqX}, ${this.hqY})`);
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
