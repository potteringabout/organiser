/* eslint-disable react/prop-types */
import {
  Clock,
  User,
  AlarmClock,
  ChevronDown,
  ChevronRight,
  ListTodo,
  MessageSquare,
  ExternalLink,
  Trash2
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import StatusDropdown from "./statusDropdown";
import { format, parseISO, isBefore } from "date-fns";
import { useState } from "react";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import SnoozeButton from "@/components/ui/snooze";
import DropdownMenu from "@/components/ui/ellipseDropDown";
import { useTasks } from "@/organiser/store/useTasks";
import { useNotes } from "@/organiser/store/useNotes";

export default function MeetingCard({ meeting }) {
  const { deleteTask, upsertTask, getTask, getSubtasks } = useTasks();
  const { deleteNote, upsertNote, getNotesForTask, getNotesForBoard } = useNotes();

  return (
    <div
      className={`rounded-2xl shadow p-2 mb-2 border hover:shadow-md transition`}
    >
      {/* Header Row */}
      <div className="flex w-full gap-2">
        <div className="w-3/4 overflow-hidden">
          <div className="prose prose-sm max-w-none">
            <MarkdownEditable
              updateId={meeting.id}
              value={meeting.title}
              showToolbar={false}
              onSave={(newText) => upsertTask({ id: meeting.id, title: newText })}
            />
          </div>
        </div>
      </div>


    </div>
  );
}
