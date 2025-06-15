// 联系人类型
export interface Contact {
  id: string;
  name: string;
  type: 'friend' | 'colleague' | 'family' | 'acquaintance' | 'self';
  coins: number;
  phone?: string;
  email?: string;
  notes?: string;
}

// 低熵提醒类型
export interface EntropyAlert {
  id: string;
  name: string;
  days: number;
  suggestion: string;
}

// 交互记录类型
export interface Interaction {
  id: string;
  date: string;
  type: 'favor_received' | 'favor_given' | 'social' | 'other';
  description: string;
  coins: number;
  notes?: string;
  originalInput?: string;
} 