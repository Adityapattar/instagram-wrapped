import json
import re
import zipfile
from pathlib import Path
from typing import Any, Dict, List

EMOJI_PATTERN = re.compile(
    r"[\U0001F300-\U0001F6FF\U0001F900-\U0001F9FF\U0001FA70-\U0001FAFF]+",
    flags=re.UNICODE,
)


def _safe_string(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return str(value)


def _format_reactions(reactions: List[Dict[str, Any]]) -> str:
    if not reactions:
        return ""
    reaction_values = []
    for reaction in reactions:
        emoji = reaction.get("reaction") or reaction.get("emoji")
        actor = reaction.get("actor")
        if emoji and actor:
            reaction_values.append(f"{emoji} ({actor})")
        elif emoji:
            reaction_values.append(str(emoji))
    return ", ".join(reaction_values)


def _extract_message_type(message: Dict[str, Any]) -> str:
    if message.get("photos"):
        return "photo"
    if message.get("videos"):
        return "video"
    if message.get("files"):
        return "file"
    if message.get("sticker"):
        return "sticker"
    return message.get("type", "text") or "text"


def _find_message_files(root: Path) -> List[Path]:
    candidate_paths = list(root.glob("messages/inbox/*/message_*.json"))
    if candidate_paths:
        return sorted(candidate_paths)
    return sorted(root.rglob("message_*.json"))


def extract_zip_to_folder(zip_path: Path, destination: Path) -> Path:
    if not zipfile.is_zipfile(zip_path):
        raise ValueError("Uploaded file is not a valid ZIP archive.")

    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as archive:
        archive.extractall(destination)
    return destination


def _normalize_message(raw_message: Dict[str, Any], chat_id: str) -> Dict[str, Any]:
    timestamp_ms = raw_message.get("timestamp_ms")
    if timestamp_ms is None:
        raise ValueError("Message is missing timestamp_ms")

    return {
        "chat_id": chat_id,
        "sender": _safe_string(raw_message.get("sender_name", "")),
        "timestamp": int(timestamp_ms),
        "message": _safe_string(raw_message.get("content", "")),
        "message_type": _extract_message_type(raw_message),
        "reaction": _format_reactions(raw_message.get("reactions", [])),
    }


def parse_instagram_export(zip_path: Path, extract_root: Path) -> List[Dict[str, Any]]:
    extracted_path = extract_zip_to_folder(zip_path, extract_root / "exported")
    message_files = _find_message_files(extracted_path)

    if not message_files:
        raise ValueError("Could not find Instagram message JSON files in the uploaded export.")

    normalized_messages: List[Dict[str, Any]] = []
    for message_file in message_files:
        content = message_file.read_text(encoding="utf-8")
        payload = json.loads(content)
        chat_id = message_file.parent.name
        for raw_message in payload.get("messages", []):
            try:
                normalized_messages.append(_normalize_message(raw_message, chat_id))
            except ValueError:
                continue

    return normalized_messages


def extract_emojis(text: str) -> List[str]:
    return EMOJI_PATTERN.findall(text or "")
