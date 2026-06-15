export interface StatSummary {
  total_messages: number;
  first_message_date: string | null;
  most_active_day: {
    date: string;
    count: number;
  } | null;
  average_messages_per_day: number;
  late_night_activity: {
    count: number;
    ratio: number;
  };
  longest_streak_days: number;
  average_reply_hours: number | null;
  peak_talking_hour: number | null;
  favorite_emoji: {
    emoji: string;
    count: number;
  } | null;
}

export interface TimelinePoint {
  date: string;
  count: number;
}

export interface ActivityHourPoint {
  hour: number;
  count: number;
}

export interface ActivityWeekdayPoint {
  weekday: string;
  count: number;
}

export interface TopChatPoint {
  chat_id: string;
  count: number;
}

export interface ActivityPayload {
  hourly: ActivityHourPoint[];
  weekday: ActivityWeekdayPoint[];
  top_chats: TopChatPoint[];
}

export interface EmojiPoint {
  emoji: string;
  count: number;
}

export interface HeatmapPoint {
  weekday: string;
  hour: number;
  count: number;
}
