export interface Event {
  id: string;
  created_at: Date;
  type: EventType;
  title: string;
  description: string;
  active: boolean;
  active_date_time: Date;
  checkin: Checkin[];
}

export interface Checkin {
  id: string;
  checkin_time?: string;
  checkout_time?: string;
  event_id: string;
  user_id?: string;
  session_type?: PrayerSessionType;
  is_makeup?: boolean;
  effective_checkin_time?: string;
  effective_checkout_time?: string;
  events?: {
    type: EventType;
  };
}

export enum EventType {
  DAILY = "DAILY",
  PRAYER_ALERT = "ALERT",
}

export type PrayerSessionType = "AM" | "PM";

export interface MakeupSession {
  id: string;
  user_id: string;
  checkin_time: string;
  checkout_time?: string;
  week_start: string;
  minutes_made_up: number;
  created_at: string;
}

export interface WeeklyPrayerStats {
  weekStart: string;
  weekEnd: string;
  expectedMinutes: number;
  actualMinutes: number;
  deficitMinutes: number;
  makeupMinutesUsed: number;
  canMakeup: boolean;
  makeupTimeAvailable: number;
}
