import { useState, useEffect } from "react";
import useTasks from "@/hooks/useTasks";
import TaskCard from "@/components/ui/taskCard";
import { CheckCircle, Hourglass, Circle, Ban } from "lucide-react";
import { parseISO, isBefore } from "date-fns";

// eslint-disable-next-line react/prop-types
function TaskList({boardId}) {
  const { tasks, loading, error } = useTasks(boardId);
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    if (!tasks) return;
    setGrouped(
      tasks.reduce((acc, task) => {
        const isSnoozed = task.snoozedUntil && isBefore(new Date(), parseISO(task.snoozedUntil));
        const key = isSnoozed ? "snoozed" : task.status;
        acc[key] = acc[key] || [];
        acc[key].push(task);
        return acc;
      }, {})
    );
  }, [tasks]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([status, tasks]) => (
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