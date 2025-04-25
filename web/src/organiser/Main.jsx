import { useParams } from "react-router-dom";
import TaskList from "@/components/ui/taskList";

function Main() {
  const { id } = useParams();
  return (
    <main className="flex-1 shadow-2xl p-6 overflow-auto">
      <TaskList boardId={id} /> 
    </main>
  );
}

export default Main;