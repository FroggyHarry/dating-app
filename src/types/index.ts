import type { DbTimeSlot, DbActivity, DbCuisine } from '../lib/supabase';

/** 应用页面阶段 */
export type AppPhase = 'invitation' | 'intermediate' | 'scheduling' | 'confirmed' | 'admin';

/** 管理员标签页 */
export type AdminTab = 'appointments' | 'time-slots' | 'activities' | 'cuisines';

/** 约会详情 */
export interface DateDetails {
  date: string | null;
  timeSlot: string | null;
  activity: string | null;
  food: string | null;
}

/** 活动项 */
export interface Activity {
  key: string;
  label: string;
  emoji: string;
}

/** 时间段项（给 TimePicker 用） */
export interface TimeSlotGroup {
  label: string;
  slots: { hour: number; label: string }[];
}

/** 将数据库时间段按组归类 */
export function groupTimeSlots(slots: DbTimeSlot[]): TimeSlotGroup[] {
  const groups = new Map<string, { hour: number; label: string }[]>();
  const order = ['中午', '下午', '晚上', '凌晨'];
  for (const s of slots) {
    if (!s.is_active) continue;
    if (!groups.has(s.group_label)) groups.set(s.group_label, []);
    groups.get(s.group_label)!.push({ hour: s.hour, label: s.label });
  }
  return order
    .filter((g) => groups.has(g))
    .map((label) => ({ label, slots: groups.get(label)! }));
}

/** DB活动转前端活动 */
export function toActivity(a: DbActivity): Activity {
  return { key: a.key, label: a.label, emoji: a.emoji };
}

/** DB菜系转前端活动 */
export function toCuisine(c: DbCuisine): Activity {
  return { key: c.key, label: c.label, emoji: c.emoji };
}
