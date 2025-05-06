//import { useState, useMemo, useEffect } from "react";
import { useBoardTasks } from "../../organiser/store/useBoardTasks";
import TaskCard from "@/components/ui/taskCard";
import { CheckCircle, Hourglass, Circle, Ban } from "lucide-react";
//import { parseISO, isBefore } from "date-fns";

// eslint-disable-next-line react/prop-types
function TaskList({boardId}) {
  const { groupedTasks } = useBoardTasks(boardId);

  //if (loading) return <div>Loading...</div>;
  //if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([status, tasks]) => (
        <div key={status}>
          <h2 className="flex items-center gap-2">
            {getStatusIcon(status)}{status.charAt(0).toUpperCase() + status.slice(1)}
          </h2>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ))}
    </div>
  );
}

function getStatusIcon(status) {
  switch (status) {
    case "todo":
      return <Circle size={16} />;
    case "in_progress":
      return <Hourglass size={16} />;
    case "done":
      return <CheckCircle size={16} />;
    case "blocked":
      return <Ban size={16} />;
    default:
      return null;
  }
}

export default TaskList;