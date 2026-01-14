import Phaser from 'phaser';
import { GRID_CONFIG, COLORS, gridToScreen } from '../config/gameConfig';
import { Unit } from '../entities/Unit';

export class GameScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private units: Unit[] = [];
  private occupiedCells: Set<string> = new Set();

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
    this.add.text(10, 10, '운빨냥사원 - 프로토타입 v1', {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'Arial',
    });

    // 하단 설명
    this.add.text(195, 800, '그리드를 클릭해서 유닛 배치', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
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

  private screenToGrid(x: number, y: number): { row: number; col: number } | null {
    const col = Math.floor((x - GRID_CONFIG.startX) / (GRID_CONFIG.cellSize + GRID_CONFIG.padding));
    const row = Math.floor((y - GRID_CONFIG.startY) / (GRID_CONFIG.cellSize + GRID_CONFIG.padding));

    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      return { row, col };
    }
    return null;
  }
}
