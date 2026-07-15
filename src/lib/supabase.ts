import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oakzmfboquudlwbmlnkx.supabase.co';
const supabaseAnonKey = 'sb_publishable_uNFWk2f9v72-1ESL-RlHvQ_2zNZvNQi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表结构类型
export interface DbTimeSlot {
  id: number;
  hour: number;           // 0-23
  label: string;          // "12:00"
  group_label: string;    // "中午" / "下午" / "晚上" / "凌晨"
  is_active: boolean;
}

export interface DbActivity {
  id: number;
  key: string;
  label: string;
  emoji: string;
  is_active: boolean;
}

export interface DbCuisine {
  id: number;
  key: string;
  label: string;
  emoji: string;
  is_active: boolean;
}

export interface DbAppointment {
  id: number;
  date: string;
  time_slot: string;
  activity: string;
  cuisine: string;
  ip_address: string | null;
  location: string | null;
  source: string | null;
  guest_name: string | null;
  status: string | null;
  created_at: string;
}
