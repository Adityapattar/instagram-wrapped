import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import analytics
import database
import parser

ROOT = Path(__file__).resolve().parents[1]
UPLOADS_ROOT = ROOT / "uploads"
UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Instagram Wrapped API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    database.initialize_database()


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "Backend Running Successfully"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> JSONResponse:
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are accepted.")

    upload_id = uuid.uuid4().hex
    upload_dir = UPLOADS_ROOT / upload_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    destination = upload_dir / file.filename

    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        parsed_messages = parser.parse_instagram_export(destination, upload_dir)
        imported_count = database.save_messages(parsed_messages)
        chat_count = len({message["chat_id"] for message in parsed_messages})

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "imported_messages": imported_count,
                "chat_count": chat_count,
            },
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}")


@app.get("/stats")
def get_stats() -> dict:
    rows = database.fetch_messages()
    return analytics.summary_stats(rows)


@app.get("/timeline")
def get_timeline() -> list[dict]:
    rows = database.fetch_messages()
    return analytics.timeline(rows)


@app.get("/activity")
def get_activity() -> dict:
    rows = database.fetch_messages()
    return analytics.activity(rows)


@app.get("/emojis")
def get_emojis() -> list[dict]:
    rows = database.fetch_messages()
    return analytics.emojis(rows)


@app.get("/heatmap")
def get_heatmap() -> list[dict]:
    rows = database.fetch_messages()
    return analytics.heatmap(rows)


@app.get("/analytics")
def get_analytics() -> dict:
    rows = database.fetch_messages()
    return {
        "stats": analytics.summary_stats(rows),
        "timeline": analytics.timeline(rows),
        "activity": analytics.activity(rows),
        "emojis": analytics.emojis(rows),
        "heatmap": analytics.heatmap(rows),
    }


@app.get("/conversations")
def get_conversations(limit: int = 100, search: str = "") -> dict:
    """
    Get detailed conversation analytics for all chats.
    
    Query Parameters:
        limit: Maximum number of conversations to return (default: 100)
        search: Filter conversations by chat_id (case-insensitive substring match)
    """
    rows = database.fetch_messages()
    conversations = analytics.conversation_analytics(rows, limit=limit, search_query=search)
    return {
        "total_conversations": len(conversations),
        "conversations": conversations,
    }


@app.get("/messages/{chat_id}")
def get_chat_messages(
    chat_id: str,
    q: str = "",
    min_len: int = 0,
    max_len: int = 10000,
    limit: int = 500,
) -> dict:
    """
    Get messages from a specific conversation with search and length filtering.
    
    Path Parameters:
        chat_id: The conversation ID to fetch messages from
    
    Query Parameters:
        q: Search keyword (case-insensitive substring match)
        min_len: Minimum message length in characters (default: 0)
        max_len: Maximum message length in characters (default: 10000)
        limit: Maximum number of messages to return (default: 500)
    """
    messages = database.fetch_chat_messages(
        chat_id=chat_id,
        search_query=q,
        min_length=min_len,
        max_length=max_len,
        limit=limit,
    )
    return {
        "chat_id": chat_id,
        "total_messages": len(messages),
        "messages": messages,
    }
