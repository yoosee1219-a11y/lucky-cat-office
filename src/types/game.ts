// 직급 (UnitType)
export enum UnitType {
  INTERN = 'intern',   // 인턴
  AGENT = 'agent',     // 대리
  MANAGER = 'manager', // 과장
}

// 등급 (Grade)
export enum Grade {
  GRADE_1 = 1, // 일반
  GRADE_2 = 2, // 레어
  GRADE_3 = 3, // 에픽
}

// 유닛 데이터 구조
export interface UnitData {
  id: string;
  type: UnitType;
  grade: Grade;
  position: { row: number; col: number };
  stats: UnitStats;
}

export interface UnitStats {
  range: number;    // 사거리 (px)
  attack: number;   // 공격력
  attackSpeed: number; // 공격 속도 (초)
  specialAbility?: SpecialAbility;
}

export interface SpecialAbility {
  type: 'slow' | 'splash'; // 슬로우 or 스플래시
  value: number;
}

// 그리드 위치
export interface GridPosition {
  row: number;
  col: number;
}
