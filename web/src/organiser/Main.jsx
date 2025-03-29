import useOrganiserStore from "./store/organiserStore";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { parseISO, isBefore } from "date-fns";

import TaskCard from "@/components/ui/taskCard";
import { CheckCircle, Hourglass, Circle, Ban } from "lucide-react";

function TaskList() {
  const tasks = useOrganiserStore((s) => s.tasks);

  const [grouped, setGrouped] = useState({});
  //const getTasksByBoardId = useOrganiserStore((s) => s.getTasksByBoardId);
  //const setTasks = useOrganiserStore((s) => s.setTasks);
  
  useEffect(() => {
    console.log("Tasks changed");
    console.log(tasks);
    setGrouped( tasks.reduce((acc, task) => { 
      const isSnoozed = task.snoozedUntil && isBefore(new Date(), parseISO(task.snoozedUntil));
      acc[isSnoozed ? "snoozed" : task.status] = acc[isSnoozed ? "snoozed" : task.status] || [];
      acc[isSnoozed ? "snoozed" : task.status].push(task);
      
      return acc;
    }, {}) );
  }, [tasks]);


  return (
    <div className="space-y-6">
      {grouped["todo"] && (
        <div>
          <h2 className="flex items-center gap-2"><Circle size={16} />Todo</h2>
          {grouped["todo"].map((task) => (
            <TaskCard
              key={task.ID}
              task={task}
            />
          ))}
        </div>
      )}
      {grouped["in_progress"] && (
        <div>
          <h2 className="flex items-center gap-2"><Hourglass size={16} />In Progress</h2>
          {grouped["in_progress"].map((task) => (
            <TaskCard
              key={task.ID}
              task={task}
            />
          ))}
        </div>
      )}
      {grouped["done"] && (
        <div>
          <h2 className="flex items-center gap-2"><CheckCircle size={16} />Done</h2>
          {grouped["done"].map((task) => (
            <TaskCard
              key={task.ID}
              task={task}
            />
          ))}
        </div>
      )}
      {grouped["blocked"] && (
        <div>
          <h2 className="flex items-center gap-2"><Ban size={16} />Blocked</h2>
          {grouped["blocked"].map((task) => (
            <TaskCard
              key={task.ID}
              task={task}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Main() {
  const { id } = useParams();
  const { darkMode, menu } = useOrganiserStore();

  const getTasksByBoardId = useOrganiserStore((state) => state.getTasksByBoardId);

  useEffect(() => {
    async function loadTasks() {
      const data = await getTasksByBoardId(id);
      //setTasks(data);
    }
    loadTasks();
  }, [id]);
  

  return (
    <main
      className="flex-1 shadow-2xl p-6 overflow-auto">
      <TaskList />
    </main>
  );
}

export default Main;
