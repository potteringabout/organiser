from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy import event


class Board(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    owner: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    tasks: List["Task"] = Relationship(back_populates="board")
    notes: List["Note"] = Relationship(back_populates="board")


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="board.id")
    title: str
    description: Optional[str] = None
    status: str = "todo"
    due_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    snoozed_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    board: Optional[Board] = Relationship(back_populates="tasks")
    notes: List["Note"] = Relationship(back_populates="task")


class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    task_id: Optional[int] = Field(default=None, foreign_key="task.id")
    board_id: Optional[int] = Field(default=None, foreign_key="board.id")
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    task: Optional[Task] = Relationship(back_populates="notes")
    board: Optional[Board] = Relationship(back_populates="notes")


@event.listens_for(Task, "before_update", propagate=True)
@event.listens_for(Note, "before_update", propagate=True)
def receive_before_update(mapper, connection, target):
    target.last_modified = datetime.now(timezone.utc)


@event.listens_for(Task, "before_insert", propagate=True)
@event.listens_for(Note, "before_insert", propagate=True)
def receive_before_insert(mapper, connection, target):
    target.last_modified = datetime.now(timezone.utc)
