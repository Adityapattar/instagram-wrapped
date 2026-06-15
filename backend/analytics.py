import re
from datetime import date, timedelta
from typing import Dict, List

import pandas as pd

WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
EMOJI_REGEX = re.compile(
    r"[\U0001F300-\U0001F5FF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF]+",
    flags=re.UNICODE,
)


def _build_dataframe(rows: List[Dict[str, object]]) -> pd.DataFrame:
    if not rows:
        return pd.DataFrame(
            columns=["chat_id", "sender", "timestamp", "message", "message_type", "reaction"]
        )

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df = df.sort_values(["chat_id", "timestamp"]).reset_index(drop=True)
    df["date"] = df["timestamp"].dt.date
    df["hour"] = df["timestamp"].dt.hour
    df["weekday"] = df["timestamp"].dt.day_name()
    return df


def _extract_top_emojis(messages: pd.Series, limit: int = 10) -> List[Dict[str, object]]:
    emoji_counts: Dict[str, int] = {}
    for text in messages.dropna().astype(str):
        for emoji in EMOJI_REGEX.findall(text):
            emoji_counts[emoji] = emoji_counts.get(emoji, 0) + 1

    sorted_emojis = sorted(emoji_counts.items(), key=lambda pair: pair[1], reverse=True)
    return [{"emoji": emoji, "count": count} for emoji, count in sorted_emojis[:limit]]


def _extract_top_words(messages: pd.Series, limit: int = 10) -> List[Dict[str, object]]:
    stopwords = {
        "the", "and", "for", "you", "with", "that", "this", "have", "from",
        "your", "just", "like", "what", "not", "but", "can", "all", "are",
        "out", "get", "was", "too", "our", "got", "who", "how", "its",
        "don", "t", "im", "ive", "we", "me", "my", "it", "is", "on",
        "at", "in", "to", "of", "a", "an", "be", "as", "by", "or",
        "sent", "attachment", "attachments", "photo", "photos", "video", "videos",
        "image", "images", "file", "files", "media", "shared", "sharedphoto",
        "sticker", "stickers", "emoji", "reaction", "reactions", "message",
        "messages", "text", "said", "say", "says", "gif", "gifs",
        "call", "called", "missed", "voice", "audio", "please", "thanks",
    }

    word_counts: Dict[str, int] = {}
    for text in messages.dropna().astype(str):
        normalized = re.sub(r"[^a-zA-Z']+", " ", text).lower()
        for word in normalized.split():
            if len(word) < 3 or word in stopwords:
                continue
            word_counts[word] = word_counts.get(word, 0) + 1

    sorted_words = sorted(word_counts.items(), key=lambda pair: pair[1], reverse=True)
    return [{"word": word, "count": count} for word, count in sorted_words[:limit]]


def _longest_streak(dates: List[date]) -> int:
    if not dates:
        return 0
    sorted_dates = sorted(set(dates))
    longest = current = 1
    previous = sorted_dates[0]
    for current_date in sorted_dates[1:]:
        if current_date == previous + timedelta(days=1):
            current += 1
            longest = max(longest, current)
        else:
            current = 1
        previous = current_date
    return longest


def summary_stats(rows: List[Dict[str, object]]) -> Dict[str, object]:
    df = _build_dataframe(rows)
    if df.empty:
        return {
            "total_messages": 0,
            "total_chats": 0,
            "first_message_date": None,
            "most_active_day": None,
            "most_active_weekday": None,
            "most_chatted_with": None,
            "average_messages_per_day": 0.0,
            "average_message_length": 0.0,
            "media_messages": 0,
            "late_night_activity": {"count": 0, "ratio": 0.0},
            "night_owl_chat": None,
            "longest_streak_days": 0,
            "average_reply_hours": None,
            "peak_talking_hour": None,
            "favorite_emoji": None,
        }

    total_messages = int(len(df))
    first_message_date = df["timestamp"].min().date().isoformat()
    total_chats = int(df["chat_id"].nunique())
    messages_by_day = df.groupby("date").size()
    most_active_day = {
        "date": messages_by_day.idxmax().isoformat(),
        "count": int(messages_by_day.max()),
    }
    average_messages_per_day = float(messages_by_day.mean())

    chat_counts = df.groupby("chat_id").size()
    top_chat_id = chat_counts.idxmax()
    top_chat_count = int(chat_counts.max())

    weekday_counts = df.groupby("weekday").size().reindex(WEEKDAY_ORDER, fill_value=0)
    most_active_weekday = {
        "weekday": weekday_counts.idxmax(),
        "count": int(weekday_counts.max()),
    }

    average_message_length = float(df["message"].fillna("").astype(str).map(len).mean())
    media_count = int(len(df[df["message_type"] != "text"]))

    night_hours = list(range(22, 24)) + list(range(0, 4))
    late_night_df = df[df["hour"].isin(night_hours)]
    late_night_count = int(len(late_night_df))
    late_night_ratio = float(late_night_count / total_messages) if total_messages else 0.0
    if not late_night_df.empty:
        night_chat_counts = late_night_df.groupby("chat_id").size()
        night_owl_chat = {
            "chat_id": night_chat_counts.idxmax(),
            "count": int(night_chat_counts.max()),
        }
    else:
        night_owl_chat = None

    streak_days = _longest_streak(list(df["date"]))
    favorite_emoji = _extract_top_emojis(df["message"], limit=1)
    most_used_word = _extract_top_words(df["message"], limit=1)
    peak_hour = int(df.groupby("hour").size().idxmax())

    reply_df = df.copy()
    reply_df["previous_sender"] = reply_df.groupby("chat_id")["sender"].shift(1)
    reply_df["previous_timestamp"] = reply_df.groupby("chat_id")["timestamp"].shift(1)
    reply_df = reply_df[reply_df["sender"] != reply_df["previous_sender"]].dropna(subset=["previous_timestamp"])
    if not reply_df.empty:
        reply_intervals = (reply_df["timestamp"] - reply_df["previous_timestamp"]).dt.total_seconds() / 3600
        average_reply_hours = float(reply_intervals.mean())
    else:
        average_reply_hours = None

    return {
        "total_messages": total_messages,
        "total_chats": total_chats,
        "first_message_date": first_message_date,
        "most_active_day": most_active_day,
        "most_active_weekday": most_active_weekday,
        "most_chatted_with": {"chat_id": top_chat_id, "count": top_chat_count},
        "average_messages_per_day": average_messages_per_day,
        "average_message_length": round(average_message_length, 1),
        "media_messages": media_count,
        "late_night_activity": {"count": late_night_count, "ratio": round(late_night_ratio, 3)},
        "night_owl_chat": night_owl_chat,
        "longest_streak_days": streak_days,
        "average_reply_hours": average_reply_hours,
        "peak_talking_hour": peak_hour,
        "favorite_emoji": favorite_emoji[0] if favorite_emoji else None,
        "most_used_word": most_used_word[0] if most_used_word else None,
    }


def timeline(rows: List[Dict[str, object]]) -> List[Dict[str, object]]:
    df = _build_dataframe(rows)
    if df.empty:
        return []
    counts = df.groupby("date").size().reset_index(name="count")
    return [{"date": row["date"].isoformat(), "count": int(row["count"])} for _, row in counts.iterrows()]


def activity(rows: List[Dict[str, object]]) -> Dict[str, List[Dict[str, object]]]:
    df = _build_dataframe(rows)
    if df.empty:
        return {"hourly": [], "weekday": [], "top_chats": []}

    hourly = [
        {"hour": int(hour), "count": int(count)}
        for hour, count in df.groupby("hour").size().reindex(range(24), fill_value=0).items()
    ]
    weekday_counts = df.groupby("weekday").size().reindex(WEEKDAY_ORDER, fill_value=0)
    top_chats = [
        {"chat_id": chat_id, "count": int(count)}
        for chat_id, count in df.groupby("chat_id").size().sort_values(ascending=False).head(5).items()
    ]
    return {
        "hourly": hourly,
        "weekday": [{"weekday": day, "count": int(count)} for day, count in weekday_counts.items()],
        "top_chats": top_chats,
    }


def emojis(rows: List[Dict[str, object]]) -> List[Dict[str, object]]:
    df = _build_dataframe(rows)
    if df.empty:
        return []
    return _extract_top_emojis(df["message"], limit=20)


def heatmap(rows: List[Dict[str, object]]) -> List[Dict[str, object]]:
    df = _build_dataframe(rows)
    if df.empty:
        return []
    pivot = df.groupby(["weekday", "hour"]).size().reset_index(name="count")
    pivot["weekday"] = pd.Categorical(pivot["weekday"], categories=WEEKDAY_ORDER, ordered=True)
    pivot = pivot.sort_values(["weekday", "hour"])
    return [
        {"weekday": row["weekday"], "hour": int(row["hour"]), "count": int(row["count"])}
        for _, row in pivot.iterrows()
    ]


def conversation_analytics(
    rows: List[Dict[str, object]], limit: int = 100, search_query: str = ""
) -> List[Dict[str, object]]:
    """
    Get detailed analytics for each conversation partner with activity timeline.
    
    Args:
        rows: List of message dictionaries
        limit: Maximum number of conversations to return
        search_query: Filter conversations by chat_id or sender name
    
    Returns:
        List of conversation analytics sorted by message count
    """
    df = _build_dataframe(rows)
    if df.empty:
        return []

    # Group by chat_id to get conversation partners
    conversations = []
    for chat_id, group in df.groupby("chat_id"):
        if search_query and search_query.lower() not in chat_id.lower():
            continue

        total_messages = len(group)
        senders = group["sender"].unique().tolist()
        
        # Get activity breakdown by date and hour
        date_activity = group.groupby("date").size().to_dict()
        hour_activity = group.groupby("hour").size().to_dict()
        weekday_activity = group.groupby("weekday").size().to_dict()
        
        # Get first and last message dates
        first_message = group["timestamp"].min()
        last_message = group["timestamp"].max()
        days_active = len(date_activity)
        
        # Get most active day
        most_active_date = max(date_activity, key=date_activity.get) if date_activity else None
        most_active_hour = max(hour_activity, key=hour_activity.get) if hour_activity else None
        
        conversations.append({
            "chat_id": chat_id,
            "senders": senders,
            "total_messages": total_messages,
            "days_active": days_active,
            "first_message_date": first_message.date().isoformat(),
            "last_message_date": last_message.date().isoformat(),
            "most_active_date": {
                "date": most_active_date.isoformat() if most_active_date else None,
                "count": date_activity.get(most_active_date, 0) if most_active_date else 0,
            },
            "most_active_hour": {
                "hour": int(most_active_hour) if most_active_hour else None,
                "count": hour_activity.get(most_active_hour, 0) if most_active_hour else 0,
            },
            "hourly_distribution": [
                {"hour": int(hour), "count": int(count)}
                for hour, count in sorted(hour_activity.items())
            ],
            "weekday_distribution": [
                {"weekday": day, "count": int(weekday_activity.get(day, 0))}
                for day in WEEKDAY_ORDER
            ],
        })

    # Sort by total messages (descending)
    conversations.sort(key=lambda x: x["total_messages"], reverse=True)
    
    return conversations[:limit]
