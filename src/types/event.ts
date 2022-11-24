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
}

export enum EventType {
  DAILY = "DAILY",
  PRAYER_ALERT = "ALERT",
}
