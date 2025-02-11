"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Circle,
  CircleDashed,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  ChevronDown, 
  ChevronRight
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


// Status Icons
const statusIcons = {
  todo: <Circle className="w-5 h-5 text-gray-500" />,
  in_progress: <CircleDashed className="w-5 h-5 text-blue-500" />,
  done: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  blocked: <XCircle className="w-5 h-5 text-red-500" />,
};

// **TaskBoard Component**
export function TaskBoard({ tasks }) {
  const [expandedTask, setExpandedTask] = useState(null);

  // Toggle task details
  const toggleTaskDetails = (taskId) => {
    setExpandedTask((prev) => (prev === taskId ? null : taskId));
  };

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.status] = [...(acc[task.status] || []), task];
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      {Object.entries(groupedTasks).map(([status, taskList]) => (
        <div key={status} className="space-y-4">
          {/* Status Column Header */}
          <h2 className="flex items-center gap-2 font-bold text-lg">
            {statusIcons[status]} {status.replace("_", " ").toUpperCase()}
          </h2>

          {/* Tasks List */}
          {taskList.map((task) => (
            <Card key={task.ID} className="bg-white shadow-md rounded-lg p-4">
              {/* Task Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {statusIcons[task.status]}
                  <span className="font-semibold">{task.details}</span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => toggleTaskDetails(task.ID)}>
                  {expandedTask === task.ID ? "−" : "+"}
                </Button>
              </div>

              {/* Task Content */}
              {expandedTask === task.ID && (
                <CardContent className="p-2 space-y-3">
                  {/* Assigned Person */}
                  {task.forWho && (
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span>{task.forWho}</span>
                    </div>
                  )}

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span>{task.dueDate}</span>
                    </div>
                  )}

                  {/* Dependent On (Only if Blocked) */}
                  {task.status === "blocked" && task.dependentOn && (
                    <div className="text-sm text-red-500">
                      🔗 Blocked by: {task.dependentOn}
                    </div>
                  )}

                  {/* References */}
                  {task.refs?.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-gray-600 text-sm">References</Label>
                      {task.refs.map((ref, index) => (
                        <a key={index} href={ref} target="_blank" rel="noopener noreferrer" className="block text-blue-500 text-sm underline">
                          {ref}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Notes/Additional Details */}
                  <Label className="text-gray-600 text-sm">Additional Notes</Label>
                  <Textarea readOnly value={task.details} className="bg-gray-100" />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}

// **TaskList Component**
export function TaskList({ tasks }) {
  const [expandedTask, setExpandedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Toggle task details
  const toggleTaskDetails = (taskId) => {
    setExpandedTask((prev) => (prev === taskId ? null : taskId));
  };

  // Filter tasks by status
  const filteredTasks = tasks.filter((task) => statusFilter === "all" || task.status === statusFilter);

  // Group completed tasks by completion date
  const completedTasks = tasks
    .filter((task) => task.status === "done" && task.completedDate)
    .reduce((acc, task) => {
      acc[task.completedDate] = [...(acc[task.completedDate] || []), task];
      return acc;
    }, {});

  return (
    <div className="p-4">
      {/* Status Filter */}
      <div className="flex justify-end mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Tasks */}
      <div className="space-y-2">
        {filteredTasks
          .filter((task) => task.status !== "done") // Don't show completed tasks here
          .map((task) => (
            <Card key={task.ID} className="bg-white shadow-md rounded-lg px-3 py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 overflow-hidden">
                  {statusIcons[task.status]}
                  <span className="font-medium truncate max-w-[250px]">{task.details}</span>
                </div>
                <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => toggleTaskDetails(task.ID)}>
                  {expandedTask === task.ID ? "−" : "+"}
                </Button>
              </div>

              {expandedTask === task.ID && (
                <CardContent className="p-2 space-y-2">
                  {task.forWho && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{task.forWho}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{task.dueDate}</span>
                    </div>
                  )}
                  {task.status === "blocked" && task.dependentOn && (
                    <div className="text-sm text-red-500">🔗 Blocked by: {task.dependentOn}</div>
                  )}
                  {task.refs?.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-gray-600 text-sm">References</Label>
                      {task.refs.map((ref, index) => (
                        <a key={index} href={ref} target="_blank" rel="noopener noreferrer" className="block text-blue-500 text-sm underline">
                          {ref}
                        </a>
                      ))}
                    </div>
                  )}
                  <Label className="text-gray-600 text-sm">Additional Notes</Label>
                  <Textarea readOnly value={task.details} className="bg-gray-100" />
                </CardContent>
              )}
            </Card>
          ))}
      </div>

      {/* Completed Tasks */}
      {Object.keys(completedTasks).length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Completed Tasks</h2>
          {Object.entries(completedTasks).map(([date, tasks]) => (
            <div key={date} className="mb-4">
              <h3 className="font-semibold text-lg text-gray-600 mb-2">📅 {date}</h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.ID} className="bg-gray-100 shadow-md rounded-lg px-3 py-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {statusIcons[task.status]}
                        <span className="font-medium truncate max-w-[250px]">{task.details}</span>
                      </div>
                      <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => toggleTaskDetails(task.ID)}>
                        {expandedTask === task.ID ? "−" : "+"}
                      </Button>
                    </div>

                    {expandedTask === task.ID && (
                      <CardContent className="p-2 space-y-2">
                        {task.forWho && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>{task.forWho}</span>
                          </div>
                        )}
                        {task.refs?.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-gray-600 text-sm">References</Label>
                            {task.refs.map((ref, index) => (
                              <a key={index} href={ref} target="_blank" rel="noopener noreferrer" className="block text-blue-500 text-sm underline">
                                {ref}
                              </a>
                            ))}
                          </div>
                        )}
                        <Label className="text-gray-600 text-sm">Notes</Label>
                        <Textarea readOnly value={task.details} className="bg-gray-200" />
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskBoard2({ tasks }) {
    const [expandedTask, setExpandedTask] = useState(null);
    const [showTodo, setShowTodo] = useState(true);
    const [showBlocked, setShowBlocked] = useState(true);
  
    // Toggle task details
    const toggleTaskDetails = (taskId) => {
      setExpandedTask((prev) => (prev === taskId ? null : taskId));
    };
  
    // Toggle collapsible sections
    const toggleSection = (section) => {
      if (section === "todo") setShowTodo((prev) => !prev);
      if (section === "blocked") setShowBlocked((prev) => !prev);
    };
  
    // Group completed tasks by completion date
    const completedTasks = tasks
      .filter((task) => task.status === "done" && task.completedDate)
      .reduce((acc, task) => {
        acc[task.completedDate] = [...(acc[task.completedDate] || []), task];
        return acc;
      }, {});
  
    // Filter tasks by status
    const todoTasks = tasks.filter((task) => task.status === "todo");
    const blockedTasks = tasks.filter((task) => task.status === "blocked");
    const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  
    return (
      <div className="p-4 space-y-6">
        {/* To-Do & Blocked Tasks (Collapsible) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* To-Do Column */}
          <div>
            <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => toggleSection("todo")}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                {statusIcons.todo} To Do
              </h2>
              {showTodo ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>
            {showTodo && (
              <div className="space-y-2">
                {todoTasks.map((task) => (
                  <TaskCard key={task.ID} task={task} expandedTask={expandedTask} toggleTaskDetails={toggleTaskDetails} />
                ))}
              </div>
            )}
          </div>
  
          {/* Blocked Column */}
          <div>
            <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => toggleSection("blocked")}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                {statusIcons.blocked} Blocked
              </h2>
              {showBlocked ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>
            {showBlocked && (
              <div className="space-y-2">
                {blockedTasks.map((task) => (
                  <TaskCard key={task.ID} task={task} expandedTask={expandedTask} toggleTaskDetails={toggleTaskDetails} />
                ))}
              </div>
            )}
          </div>
        </div>
  
        {/* In Progress (Full Width) */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {statusIcons.in_progress} In Progress
          </h2>
          <div className="space-y-2">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.ID} task={task} expandedTask={expandedTask} toggleTaskDetails={toggleTaskDetails} fullWidth />
            ))}
          </div>
        </div>
  
        {/* Completed Tasks Grouped by Date (Full Width) */}
        {Object.keys(completedTasks).length > 0 && (
          <div>
            <h2 className="text-xl font-bold">Completed Tasks</h2>
            {Object.entries(completedTasks).map(([date, tasks]) => (
              <div key={date} className="mt-4">
                <h3 className="font-semibold text-gray-600 mb-2">📅 {date}</h3>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskCard key={task.ID} task={task} expandedTask={expandedTask} toggleTaskDetails={toggleTaskDetails} fullWidth />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // **TaskCard Component**
  function TaskCard({ task, expandedTask, toggleTaskDetails, fullWidth = false }) {
    return (
      <Card className={`bg-white shadow-md rounded-lg px-3 py-2 ${fullWidth ? "w-full" : ""}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden">
            {statusIcons[task.status]}
            <span className="font-medium truncate max-w-[250px]">{task.details}</span>
          </div>
          <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => toggleTaskDetails(task.ID)}>
            {expandedTask === task.ID ? "−" : "+"}
          </Button>
        </div>
  
        {expandedTask === task.ID && (
          <CardContent className="p-2 space-y-2">
            {task.forWho && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{task.forWho}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{task.dueDate}</span>
              </div>
            )}
            {task.status === "blocked" && task.dependentOn && (
              <div className="text-sm text-red-500">🔗 Blocked by: {task.dependentOn}</div>
            )}
            {task.refs?.length > 0 && (
              <div className="space-y-1">
                <Label className="text-gray-600 text-sm">References</Label>
                {task.refs.map((ref, index) => (
                  <a key={index} href={ref} target="_blank" rel="noopener noreferrer" className="block text-blue-500 text-sm underline">
                    {ref}
                  </a>
                ))}
              </div>
            )}
            <Label className="text-gray-600 text-sm">Additional Notes</Label>
            <Textarea readOnly value={task.details} className="bg-gray-100" />
          </CardContent>
        )}
      </Card>
    );
  }