export enum Role {
  ADMIN = 'admin',     // مسؤول
  SERVANT = 'servant', // خادم
  PRIEST = 'priest',   // كاهن
}

export enum Grade {
  FIRST = 'first',
  SECOND = 'second',
  THIRD = 'third',
  FOURTH = 'fourth',
  FIFTH = 'fifth',
  SIXTH = 'sixth',
}

// الأسماء العربية للعرض في الواجهة والتقارير
export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.FIRST]: 'فصل سنة أولى',
  [Grade.SECOND]: 'فصل سنة تانية',
  [Grade.THIRD]: 'فصل سنة تالتة',
  [Grade.FOURTH]: 'فصل سنة رابعة',
  [Grade.FIFTH]: 'فصل سنة خامسة',
  [Grade.SIXTH]: 'فصل سنة سادسة',
};