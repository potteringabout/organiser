import { useBoardTasks } from "./store/useBoardTasks";
import TaskCard from "@/components/ui/taskCard";
import { CheckCircle, Hourglass, Circle, Ban } from "lucide-react";
import { useParams } from "react-router-dom";

// eslint-disable-next-line react/prop-types
function Board() {
  const { boardId } = useParams();
  const { groupedTasks } = useBoardTasks(boardId);

  const statuses = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
    blocked: "Blocked",
  }

  if (!boardId) {
    return <div>Select or create a board</div>;
  }
  
  //if (loading) return <div>Loading...</div>;
  //if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([status, tasks]) => (
        <div key={status}>
          <h2 className="flex items-center gap-2">
            {getStatusIcon(status)} {statuses[status]}
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

export default Board;