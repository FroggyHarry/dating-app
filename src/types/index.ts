/** 应用页面阶段 */
export type AppPhase = 'invitation' | 'intermediate' | 'scheduling' | 'confirmed';

/** 约会详情 */
export interface DateDetails {
  date: string | null;       // ISO "YYYY-MM-DD"
  timeSlot: string | null;   // "HH:00"
  activity: string | null;   // activity key
  food: string | null;       // cuisine key
}

/** 活动项 */
export interface Activity {
  key: string;
  label: string;
  emoji: string;
}
