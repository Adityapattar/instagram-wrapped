from pydantic import BaseModel
from typing import Any, Dict, List, Optional


class UploadResponse(BaseModel):
    success: bool
    imported_messages: int
    chat_count: int


class StatisticCard(BaseModel):
    total_messages: int
    first_message_date: Optional[str]
    most_active_day: Optional[Dict[str, Any]]
    average_messages_per_day: float
    late_night_activity: Dict[str, Any]
    longest_streak_days: int
    average_reply_hours: Optional[float]
    peak_talking_hour: Optional[int]
    favorite_emoji: Optional[Dict[str, Any]]


class TimelinePoint(BaseModel):
    date: str
    count: int


class ActivityPoint(BaseModel):
    hour: int
    count: int


class HeatmapPoint(BaseModel):
    weekday: str
    hour: int
    count: int


class EmojiPoint(BaseModel):
    emoji: str
    count: int


class ConversationActivityPoint(BaseModel):
    hour: int
    count: int


class ConversationWeekdayPoint(BaseModel):
    weekday: str
    count: int


class ActiveDateInfo(BaseModel):
    date: Optional[str]
    count: int


class ActiveHourInfo(BaseModel):
    hour: Optional[int]
    count: int


class ConversationAnalytics(BaseModel):
    chat_id: str
    senders: List[str]
    total_messages: int
    days_active: int
    first_message_date: str
    last_message_date: str
    most_active_date: ActiveDateInfo
    most_active_hour: ActiveHourInfo
    hourly_distribution: List[ConversationActivityPoint]
    weekday_distribution: List[ConversationWeekdayPoint]


class ConversationsResponse(BaseModel):
    total_conversations: int
    conversations: List[ConversationAnalytics]
