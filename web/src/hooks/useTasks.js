import { useState, useEffect } from "react";
import useOrganiserStore from "@/organiser/store/organiserStore";

function useTasks(boardId) {
  const getBoardTasks = useOrganiserStore((state) => state.getBoardTasks);
  const boardTasks = useOrganiserStore((state) => state.boardTasks);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!boardId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadTasks() {
      setLoading(true);
      setError(null);
      try {
        await getBoardTasks(boardId);
        if (isMounted) {
          const updatedTasks = boardTasks[boardId] || [];
          setTasks(updatedTasks);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTasks();

    return () => { isMounted = false };
  }, [boardId, boardTasks, getBoardTasks]);

  return { tasks, loading, error };
}

export default useTasks;