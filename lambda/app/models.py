from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy import event
from enum import Enum


class EntityType(str, Enum):
    PERSON = "person"
    TEAM = "team"


class Visibility(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"
    SHARED = "shared"


class Status(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"
    IGNORED = "ignored"
    BLOCKED = "blocked"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Board(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    owner: str
    visibility: Visibility = Field(default=Visibility.PRIVATE)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    tasks: List["Task"] = Relationship(back_populates="board", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    notes: List["Note"] = Relationship(back_populates="board", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class TaskBlocker(SQLModel, table=True):
    task_id: int = Field(foreign_key="task.id", primary_key=True)
    blocker_id: int = Field(foreign_key="entity.id", primary_key=True)

    task: "Task" = Relationship(back_populates="blockers")
    blocker: "Entity" = Relationship()


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="board.id")
    parent_id: Optional[int] = Field(default=None, foreign_key="task.id")

    title: str
    description: Optional[str] = None
    status: Status = Field(default=Status.TODO)
    priority: Optional[Priority] = Field(default=None)
    due_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    snoozed_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    archived: bool = False
    meeting_id: Optional[int] = Field(default=None, foreign_key="meeting.id")
    owner: str

    board: Optional[Board] = Relationship(back_populates="tasks")
    notes: List["Note"] = Relationship(back_populates="task")
    meeting: Optional["Meeting"] = Relationship(back_populates="tasks")
    blockers: List[TaskBlocker] = Relationship(back_populates="task")

    parent_task: Optional["Task"] = Relationship(back_populates="sub_tasks", sa_relationship_kwargs={"remote_side": "Task.id"})
    sub_tasks: List["Task"] = Relationship(back_populates="parent_task")

    def to_dict(self):
        return {
            "title": self.title,
            "id": self.id,
            "created_at": self.created_at,
            "last_modified": self.last_modified,
            "archived": self.archived,
            "description": self.description,
            "due_date": self.due_date,
            "priority": self.priority,
            "assigned_to": self.assigned_to,
            "snoozed_until": self.snoozed_until,
            "status": self.status,
            "board_id": self.board_id,
            "parent_id": self.parent_id
        }


class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    task_id: Optional[int] = Field(default=None, foreign_key="task.id")
    board_id: Optional[int] = Field(default=None, foreign_key="board.id")
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    meeting_id: Optional[int] = Field(default=None, foreign_key="meeting.id")
    owner: str

    task: Optional[Task] = Relationship(back_populates="notes")
    board: Optional[Board] = Relationship(back_populates="notes")
    meeting: Optional["Meeting"] = Relationship(back_populates="notes")


class Recurrence(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"


class MeetingEntity(SQLModel, table=True):
    meeting_id: int = Field(foreign_key="meeting.id", primary_key=True)
    entity_id: int = Field(foreign_key="entity.id", primary_key=True)

    meeting: "Meeting" = Relationship(back_populates="attendees")
    entity: "Entity" = Relationship()


class Meeting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="board.id")
    title: str
    description: Optional[str] = None
    datetime: datetime
    recurrence: Recurrence = Field(default=Recurrence.NONE)
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    owner: str

    board: Optional[Board] = Relationship()
    attendees: List[MeetingEntity] = Relationship(back_populates="meeting")
    tasks: List[Task] = Relationship(back_populates="meeting")
    notes: List[Note] = Relationship(back_populates="meeting")


class Entity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: EntityType = Field(default=EntityType.PERSON)
    email: Optional[str] = None
    description: Optional[str] = None
    owner: str


@event.listens_for(Task, "before_update", propagate=True)
@event.listens_for(Note, "before_update", propagate=True)
@event.listens_for(Meeting, "before_update", propagate=True)
def receive_before_update(mapper, connection, target):
    target.last_modified = datetime.now(timezone.utc)


@event.listens_for(Task, "before_insert", propagate=True)
@event.listens_for(Note, "before_insert", propagate=True)
@event.listens_for(Meeting, "before_insert", propagate=True)
def receive_before_insert(mapper, connection, target):
    target.last_modified = datetime.now(timezone.utc)