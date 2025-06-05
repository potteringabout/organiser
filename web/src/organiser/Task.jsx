import { useStore } from "./store/useStore";
import TaskCard from "@/components/ui/taskCard";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

function Task() {
  const { taskId } = useParams();
  const tasks = useStore(state => state.tasks);

  const task = useMemo(() => {
    console.log('useMemo for Task:', taskId);
    return tasks.find(task => String(task.id) === String(taskId));
  }, [taskId, tasks]);

  if (!task) return <div>Loading task...</div>;

  return (
    <div className="space-y-6">
      <TaskCard task={task} expanded={true} />
    </div>
  );
}

export default Task;