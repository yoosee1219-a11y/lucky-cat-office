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
  hqMaxHealth: 50, // HQ 체력 (50마리 도달하면 패배)
};

// 적의 이동 경로 (그리드 바깥쪽을 빙글빙글 돔)
export const ENEMY_PATH = [
  { x: 390, y: 200 },   // 1. 시작: 오른쪽 위
  { x: 390, y: 650 },   // 2. 오른쪽 아래로
  { x: 50, y: 650 },    // 3. 왼쪽 아래로
  { x: 50, y: 300 },    // 4. 왼쪽으로 올라감
  { x: 195, y: 300 },   // 5. 중앙 (HQ)으로
];

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
