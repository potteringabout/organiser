/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Circle,
  CircleDashed,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Status Icons
const statusIcons = {
  todo: <Circle className="w-5 h-5 text-gray-500" />, 
  in_progress: <CircleDashed className="w-5 h-5 text-blue-500" />, 
  done: <CheckCircle2 className="w-5 h-5 text-green-500" />, 
  blocked: <XCircle className="w-5 h-5 text-red-500" />, 
};

export function EditableTaskBoard({ tasks }) {
  const [taskList, setTaskList] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    console.log("Tasks changed: ", tasks); // Debug: Check if tasks change is detected
    setTaskList(tasks);
  }, [tasks]);

  const toggleTaskDetails = (taskId) => {
    setExpandedTask((prev) => (prev === taskId ? null : taskId));
  };

  const handleUpdateTask = (taskId, field, value) => {
    console.log("Updating task", taskId, field, value);
    setTaskList((prev) =>
      prev.map((task) => (task.ID === taskId ? { ...task, [field]: value } : task))
    );
  };

  // Filter tasks by status
  const todoTasks = useMemo(() => taskList.filter(task => task.status?.trim().toLowerCase() === "todo"), [taskList]);
  const blockedTasks = useMemo(() => taskList.filter(task => task.status?.trim().toLowerCase() === "blocked"), [taskList]);
  const inProgressTasks = useMemo(() => taskList.filter(task => task.status?.trim().toLowerCase() === "in_progress"), [taskList]);
  const completedTasks = useMemo(() => taskList.filter(task => task.status?.trim().toLowerCase() === "done"), [taskList]);

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskSection title="To Do" tasks={todoTasks} expandedTask={expandedTask} toggleTaskDetails={toggleTaskDetails} handleUpdateTask={handleUpdateTask} />
        <TaskSection title="Blocked" tasks={blockedTasks} expandedTask={expandedTask} toggleTaskDetails={toggleTaskDetails} handleUpdateTask={handleUpdateTask} />
      </div>
      <TaskSection title="In Progress" tasks={inProgressTasks} expandedTask={expandedTask} toggleTaskDetails={toggleTaskDetails} handleUpdateTask={handleUpdateTask} fullWidth />
      <TaskSection title="Completed" tasks={completedTasks} expandedTask={expandedTask} toggleTaskDetails={toggleTaskDetails} handleUpdateTask={handleUpdateTask} fullWidth />
    </div>
  );
}

function TaskSection({ title, tasks, expandedTask, toggleTaskDetails, handleUpdateTask, fullWidth = false }) {
  return (
  <div className={fullWidth ? "col-span-2" : ""}>
    <h2 className="text-lg font-bold">{title}</h2>
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <p>No tasks</p>
      ) : (
        tasks.map((task) => (
          <EditableTaskCard
            key={task.ID}
            task={task}
            expandedTask={expandedTask}
            toggleTaskDetails={toggleTaskDetails}
            handleUpdateTask={handleUpdateTask}
          />
        ))
      )}
    </div>
  </div>
  );
}

function EditableTaskCard({ task, expandedTask, toggleTaskDetails, handleUpdateTask }) {
  const isExpanded = expandedTask === task.ID;

  return (
    <Card className="bg-white shadow-md rounded-lg px-3 py-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleTaskDetails(task.ID)}>
          {statusIcons[task.status]}
          {!isExpanded && (
            <span className="font-medium truncate max-w-[250px]">
              {task.details?.length ? task.details[task.details.length - 1].text : "-"}
            </span>
          )}
        </div>
        <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => toggleTaskDetails(task.ID)}>
          {isExpanded ? "−" : "+"}
        </Button>
      </div>

      {isExpanded && (
        <CardContent className="p-2 space-y-2">
          <EditableField label="Details" value={task.details} field="details" task={task} handleUpdateTask={handleUpdateTask} isList />
          <EditableField label="Status" value={task.status} field="status" task={task} handleUpdateTask={handleUpdateTask} isSelect />
          <EditableField label="Due Date" value={task.dueDate} field="dueDate" task={task} handleUpdateTask={handleUpdateTask} isDate />
          <EditableField label="Assigned To" value={task.forWho} field="forWho" task={task} handleUpdateTask={handleUpdateTask} />
        </CardContent>
      )}
    </Card>
  );
}


function EditableField({ label, value, field, task, handleUpdateTask, isList = false, isSelect = false, isDate = false }) {
  const [isEditing, setEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(isList ? value || [] : value || "");
  const [newDetail, setNewDetail] = useState("");

  const handleBlur = () => {
    setEditing(false);
    if (JSON.stringify(editedValue) !== JSON.stringify(value)) {
      handleUpdateTask(task.ID, field, editedValue);
    }
  };

  const addNewDetail = () => {
    if (newDetail.trim() === "") return;
    const updatedDetails = [...editedValue, { text: newDetail, date: new Date().toISOString() }];
    setEditedValue(updatedDetails);
    setNewDetail("");
  };

  return (
    <div onClick={() => setEditing(true)} className="space-y-2">
      <Label className="text-gray-600 text-sm">{label}</Label>
      
      {isEditing ? (
        isList ? (
          <div className="space-y-1">
            {editedValue.map((item, index) => (
              <div key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                <span>{item.text}</span>
                <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                placeholder="Add new detail..."
              />
              <Button onClick={addNewDetail} variant="outline">+</Button>
            </div>
            <Button onClick={handleBlur} variant="default">Save</Button>
          </div>
        ) : isSelect ? (
          <Select
            value={editedValue}
            onValueChange={(newValue) => {
              setEditedValue(newValue);
              setEditing(false);
              handleUpdateTask(task.ID, field, newValue);
            }}
          >
            <SelectTrigger>
              <SelectValue>{editedValue}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(statusIcons).map((key) => (
                <SelectItem key={key} value={key}>
                  {statusIcons[key]} {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : isDate ? (
          <Input
            type="date"
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            onBlur={handleBlur}
            autoFocus
          />
        ) : (
          <Input
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            onBlur={handleBlur}
            autoFocus
          />
        )
      ) : isList ? (
        <div className="space-y-1">
          {value?.length > 0 ? (
            value.map((item, index) => (
              <div key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                <span>{item.text}</span>
                <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No details added yet.</p>
          )}
        </div>
      ) : (
        <p>{value || "-"}</p>
      )}
    </div>
  );
}