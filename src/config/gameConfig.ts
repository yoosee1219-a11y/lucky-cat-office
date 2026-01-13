import type { GridPosition } from '../types/game';

// 그리드 설정
export const GRID_CONFIG = {
  rows: 5,
  cols: 5,
  cellSize: 64, // px
  padding: 8,   // 셀 간격

  // 중앙 본사 위치
  hqPosition: { row: 2, col: 2 } as GridPosition,

  // 시작 좌표 계산
  startX: (390 - (5 * 64)) / 2,
  startY: (844 / 2) - (5 * 64 / 2) + 50, // 하단 UI 공간 확보
};

// Phaser 게임 설정
export const GAME_CONFIG = {
  width: 390,
  height: 844,
  parent: 'game-container',
  backgroundColor: '#f5f5f5',
};

// 색상 설정
export const COLORS = {
  gridCell: 0xe0e0e0,      // 일반 셀
  hqCell: 0xffd700,        // 본사 (금색)
  gridLine: 0xcccccc,      // 그리드 라인
  text: 0x333333,          // 텍스트
};

// 그리드 좌표 → 화면 좌표 변환
export function gridToScreen(row: number, col: number): { x: number; y: number } {
  return {
    x: GRID_CONFIG.startX + col * (GRID_CONFIG.cellSize + GRID_CONFIG.padding),
    y: GRID_CONFIG.startY + row * (GRID_CONFIG.cellSize + GRID_CONFIG.padding),
  };
}

// 화면 좌표 → 그리드 좌표 변환
export function screenToGrid(x: number, y: number): GridPosition | null {
  const col = Math.floor((x - GRID_CONFIG.startX) / (GRID_CONFIG.cellSize + GRID_CONFIG.padding));
  const row = Math.floor((y - GRID_CONFIG.startY) / (GRID_CONFIG.cellSize + GRID_CONFIG.padding));

  if (row >= 0 && row < 5 && col >= 0 && col < 5) {
    return { row, col };
  }
  return null;
}
