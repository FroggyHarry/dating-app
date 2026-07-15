const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 获取某年某月的日历网格 (6行×7列)
 * 返回 day 数字，null 表示填充的空白格
 */
export function getMonthGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid: (number | null)[][] = [];
  let week: (number | null)[] = [];

  // 填充月初空白
  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }

  // 填充日期
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  // 填充月末空白
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    grid.push(week);
  }

  return grid;
}

/** 判断日期是否是今天 */
export function isToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;
}

/** 判断日期是否已过去 */
export function isPast(year: number, month: number, day: number): boolean {
  const now = new Date();
  const target = new Date(year, month, day);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return target < todayStart;
}

/** 判断日期是否超过未来10天 */
export function isOutOfRange(year: number, month: number, day: number): boolean {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const maxDate = new Date(todayStart);
  maxDate.setDate(maxDate.getDate() + 10);
  const target = new Date(year, month, day);
  return target > maxDate;
}

/** 格式化日期为中文 */
export function formatDateCN(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  return `${month}月${day}日 周${weekday}`;
}

/** 格式化时间为中文 */
export function formatTimeCN(time: string): string {
  const hour = parseInt(time.split(':')[0], 10);
  return hour < 12 ? `上午 ${hour}:00` : `下午 ${hour - 12}:00`;
}

/** 获取活动标签 */
export function getActivityLabel(activities: { key: string; label: string; emoji: string }[], key: string): string {
  const a = activities.find((a) => a.key === key);
  return a ? `${a.emoji} ${a.label}` : key;
}

export { WEEKDAYS };
