/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react'
import { useStore } from './useStore'
import { fetchBoardTasks } from '../services/taskService'
import { parseISO, isBefore } from "date-fns";

export const useBoardTasks = (boardId) => {

  const tasks = useStore(state => state.tasks)
  const upsertTaskLocal = useStore(state => state.upsertTaskLocal) 
  
  // Initialize and memoize boardTasks
  const boardTasks = useMemo(() => {
    console.log('useMemo for boardTasks :' + boardId)
    // Return parent tasks, not sub tasks
    const b = tasks.filter(task => task.board_id == boardId && task.parent_id == null)
    return b
  }, [boardId, tasks])

  const groupedTasks = useMemo(() => {
    //if (!boardId) return { groupedTasks: [] }; // or null
    
    console.log('useMemo for grouping :' + boardTasks + "   :" + tasks)
    return boardTasks.reduce((acc, task) => {
      const isSnoozed = task.snoozedUntil && isBefore(new Date(), parseISO(task.snoozedUntil));
      const key = isSnoozed ? "snoozed" : task.status;
      acc[key] = acc[key] || [];
      acc[key].push(task);
      return acc;
    }, {});
  }, [boardTasks, tasks]);
  
  
  //What it does: Runs a side effect to fetch tasks for the board only if there are no tasks for that board already.
	//Why boardTasks.length in deps: React won’t rerun the effect if only the contents of boardTasks change without its length changing, so this keeps the dependencies narrow and intentional.
	//Why mergeTasksLocal in deps: Best practice — React warns if you omit functions used inside effects.

  //useMemo ensures boardTasks is efficiently derived from state.
	//useEffect reacts to changes in boardId or if the task list becomes empty, and kicks off the fetch if needed.
	//No unnecessary fetching: Because of the memoized boardTasks, the effect only triggers a fetch when it’s genuinely needed.
  useEffect(() => {
    console.log('useEffect')
    const load = async () => {
      const hasTasksForBoard = tasks.some(task => task.board_id == boardId  );
      if (!hasTasksForBoard) {
        try {
          const remoteTasks = await fetchBoardTasks(boardId)
          upsertTaskLocal(remoteTasks)
        } catch (err) {
          console.error('Failed to fetch tasks for board', err)
        }
      }
    }
    load()
  }, [boardId])

  return { boardTasks, groupedTasks }
}