import useOrganiserStore from "./store/organiserStore";
import { useParams } from "react-router-dom";
//import { getTasks, getBoard, getBoards } from "@/organiser/store/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EditableTaskBoard } from "@/components/ui/tasks";

import TaskCard from "@/components/ui/taskCard";

function TaskList() {
  const tasks = useOrganiserStore((s) => s.tasks);

  const [grouped, setGrouped] = useState({});
  //const getTasksByBoardId = useOrganiserStore((s) => s.getTasksByBoardId);
  //const setTasks = useOrganiserStore((s) => s.setTasks);
  
  useEffect(() => {
    console.log("Tasks changed");
    console.log(tasks);
    setGrouped( tasks.reduce((acc, task) => {
      acc[task.status] = acc[task.status] || [];
      acc[task.status].push(task);
      return acc;
    }, {}) );
  }, [tasks]);


  return (
    <div className="space-y-6">
      {grouped["todo"] && (
        <div>
          <h2>Todo</h2>
          {grouped["todo"].map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      )}
      {grouped["in_progress"] && (
        <div>
          <h2>In Progress</h2>
          {grouped["in_progress"].map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      )}
      {grouped["done"] && (
        <div>
          <h2>Done</h2>
          {grouped["done"].map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      )}
      {grouped["blocked"] && (
        <div>
          <h2>Blocked</h2>
          {grouped["blocked"].map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      )}
    </div>
  );
}
/*
function Boards({ id }) {
  const tasks = useOrganiserStore((state) => state.tasks);
  const setTasks = useOrganiserStore((state) => state.setTasks);
  const loadTasks = useOrganiserStore((state) => state.loadTasks);

  const board = useOrganiserStore((state) => state.board);
  const setBoard = useOrganiserStore((state) => state.setBoard);
  const getBoardById = useOrganiserStore((state) => state.getBoardById);

  useEffect(() => {
    loadTasks(id);
    setBoard(getBoardById(id));
  }, [id]);

  function handleDelete() {
    deleteBoard(id)
      .then(() => {
        //reloadSidebar();
        console.log("Deleted board");
        //showAlert("Board deleted successfully");
        //redirect("/organiser/boards");
        //router.push("/organiser/boards");
        //router.refresh();
      })
      .catch((error) => {
        console.error("Error:", error.message);
        //showAlert("Error deleting board", "error");
      });
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-1 justify-between">
        <p>Board: {board.Name}</p>
        <p>Description: {board.Description}</p>
        <Button onClick={handleDelete} />
      </div>
      <div className="flex-1 p-4"></div>
      <div className="flex-1 p-4">
        <Button href={`/organiser/boards/${id}/new`} />
      </div>
      <div className="flex-1">
        <EditableTaskBoard tasks={tasks} />
      </div>
    </div>
  );
}*/

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
      className={`flex-1 shadow-2xl p-6 overflow-auto ${
        darkMode ? "bg-gray-700" : "bg-gray-100"
      }`}>
      <TaskList />
    </main>
  );
}

export default Main;
