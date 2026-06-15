export interface UploadResponse {
  success: boolean;
  imported_messages: number;
  chat_count: number;
}

export interface StatCard {
  total_messages: number;
  total_chats: number;
  first_message_date: string | null;
  most_active_day: {
    date: string;
    count: number;
  } | null;
  most_active_weekday: {
    weekday: string;
    count: number;
  } | null;
  most_chatted_with: {
    chat_id: string;
    count: number;
  } | null;
  average_messages_per_day: number;
  average_message_length: number;
  media_messages: number;
  late_night_activity: {
    count: number;
    ratio: number;
  };
  night_owl_chat: {
    chat_id: string;
    count: number;
  } | null;
  longest_streak_days: number;
  average_reply_hours: number | null;
  peak_talking_hour: number | null;
  favorite_emoji: {
    emoji: string;
    count: number;
  } | null;
  most_used_word: {
    word: string;
    count: number;
  } | null;
}

export interface TimelinePoint {
  date: string;
  count: number;
}

export interface ActivityPoint {
  hour: number;
  count: number;
}

export interface WeekdayPoint {
  weekday: string;
  count: number;
}

export interface ChatPoint {
  chat_id: string;
  count: number;
}

export interface ActivityResponse {
  hourly: ActivityPoint[];
  weekday: WeekdayPoint[];
  top_chats: ChatPoint[];
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

export interface ActiveDateInfo {
  date: string | null;
  count: number;
}

export interface ActiveHourInfo {
  hour: number | null;
  count: number;
}

export interface ConversationActivityPoint {
  hour: number;
  count: number;
}

export interface ConversationWeekdayPoint {
  weekday: string;
  count: number;
}

export interface ConversationAnalytics {
  chat_id: string;
  senders: string[];
  total_messages: number;
  days_active: number;
  first_message_date: string;
  last_message_date: string;
  most_active_date: ActiveDateInfo;
  most_active_hour: ActiveHourInfo;
  hourly_distribution: ConversationActivityPoint[];
  weekday_distribution: ConversationWeekdayPoint[];
}

export interface ConversationsResponse {
  total_conversations: number;
  conversations: ConversationAnalytics[];
}

export interface MessageDetail {
  chat_id: string;
  sender: string;
  timestamp: number;
  message: string;
  message_type: string;
  reaction: string;
}

export interface ChatMessagesResponse {
  chat_id: string;
  total_messages: number;
  messages: MessageDetail[];
}

export interface AnalyticsPayload {
  stats: StatCard;
  timeline: TimelinePoint[];
  activity: ActivityResponse;
  emojis: EmojiPoint[];
  heatmap: HeatmapPoint[];
}
