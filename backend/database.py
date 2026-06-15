import sqlite3
from pathlib import Path
from typing import Any, Dict, Iterable, List

ROOT = Path(__file__).resolve().parents[1]
DATABASE_FOLDER = ROOT / "database"
DATABASE_FOLDER.mkdir(parents=True, exist_ok=True)
DATABASE_PATH = DATABASE_FOLDER / "messages.db"

connection = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
connection.row_factory = sqlite3.Row


def initialize_database() -> None:
    cursor = connection.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            message TEXT,
            message_type TEXT,
            reaction TEXT,
            UNIQUE(chat_id, sender, timestamp, message)
        )
        """
    )
    connection.commit()


def save_messages(messages: List[Dict[str, Any]]) -> int:
    if not messages:
        return 0

    cursor = connection.cursor()
    payload = [
        (
            message["chat_id"],
            message["sender"],
            message["timestamp"],
            message["message"],
            message["message_type"],
            message["reaction"],
        )
        for message in messages
    ]
    cursor.executemany(
        "INSERT OR IGNORE INTO messages (chat_id, sender, timestamp, message, message_type, reaction) VALUES (?, ?, ?, ?, ?, ?)",
        payload,
    )
    connection.commit()
    return cursor.rowcount


def fetch_messages() -> List[Dict[str, Any]]:
    cursor = connection.cursor()
    cursor.execute("SELECT chat_id, sender, timestamp, message, message_type, reaction FROM messages ORDER BY timestamp ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def fetch_chat_messages(
    chat_id: str,
    search_query: str = "",
    min_length: int = 0,
    max_length: int = 10000,
    limit: int = 500,
) -> List[Dict[str, Any]]:
    """
    Fetch messages from a specific conversation with optional search and length filters.
    
    Args:
        chat_id: The conversation ID to fetch messages from
        search_query: Search text to filter messages (case-insensitive)
        min_length: Minimum message length (characters)
        max_length: Maximum message length (characters)
        limit: Maximum number of messages to return
    
    Returns:
        List of message dictionaries matching the filters
    """
    cursor = connection.cursor()
    
    # Build the query with filters
    query = "SELECT chat_id, sender, timestamp, message, message_type, reaction FROM messages WHERE chat_id = ?"
    params: List[Any] = [chat_id]
    
    # Add search filter if provided
    if search_query.strip():
        query += " AND message LIKE ?"
        params.append(f"%{search_query}%")
    
    # Add length filters
    query += " AND LENGTH(COALESCE(message, '')) >= ? AND LENGTH(COALESCE(message, '')) <= ?"
    params.extend([min_length, max_length])
    
    # Order by timestamp and limit
    query += " ORDER BY timestamp ASC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]
