"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Calendar,
  Circle,
  CircleDashed,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";

import { upsertItem } from "@/app/client";

const f = {
  EntityType: "task",
  details: "Fix the bug in login form",
  forWho: "Alice",
  dependentOn: "Bob",
  dueDate: "2025-02-10",
  status: "in_progress",
  refs: ["https://jira.com/task123"],
};

// Sample people list
const peopleList = ["Alice", "Bob", "Charlie", "David"];
const statusOptions = [
  {
    value: "todo",
    label: "To Do",
    icon: <Circle className="w-5 h-5 text-gray-500" />,
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: <CircleDashed className="w-5 h-5 text-blue-500" />,
  },
  {
    value: "done",
    label: "Done",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  },
  {
    value: "blocked",
    label: "Blocked",
    icon: <XCircle className="w-5 h-5 text-red-500" />,
  },
];

export default function TaskOrNoteForm({boardId}) {
  const [formData, setFormData] = useState({
    EntityType: "task",
    details: "",
    forWho: "",
    dependentOn: "",
    dueDate: "",
    status: "todo",
    refs: [],
  });

  const [error, setError] = useState("");
  const [customPerson, setCustomPerson] = useState("");
  const [people, setPeople] = useState(() =>
    Array.isArray(peopleList) ? peopleList : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFormFromJson = (jsonData) => {
    setFormData(jsonData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.details.trim()) {
      setError("Details are required.");
      return;
    }
    // Check if due date is in the past
    if (formData.EntityType === "task" && formData.dueDate) {
      const today = new Date().toISOString().split("T")[0];
      if (formData.dueDate < today) {
        setError("Due date cannot be in the past.");
        return;
      }
    }

    setIsSubmitting(true); // Disable button

    /*const formData = {
      type,
      details,
      forWho: type === "task" ? forWho : null,
      dependentOn: type === "task" ? dependentOn : null,
      dueDate: type === "task" ? dueDate : null,
      status: type === "task" ? status : null,
      refs: refs.filter((ref) => ref.trim() !== ""),
    };*/
    console.log("Submitting:", formData);

    upsertItem(boardId, formData)
      .then(() => {
        console.log("Item added");
        setFormData({});  // TODO: The data is inserted.  Needo to redirect to the board.
      })
      .catch((error) => {
        console.error("Error:", error.message);
        setError("Error adding item");
      }); // Show success message
    // ✅ Clear all form fields after submission
    //setFormData({});
  };

  // Add new reference input field
  const addRefField = () => {
    setFormData({ ...formData, refs: [...formData.refs, ""] });
    setTimeout(() => {
      document.getElementById(`ref-${formData.refs.length}`)?.focus();
    }, 10);
  };

  // Add custom person to dropdown
  const addCustomPerson = () => {
    if (customPerson.trim() && !people.includes(customPerson.trim())) {
      setPeople([...people, customPerson.trim()]);
      setCustomPerson("");
    }
  };

  return (
    <div>
      <Button
        onClick={() => loadFormFromJson(f)}
        className="mb-4">
        Load Example Data
      </Button>
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
      {/* Toggle between Task & Diary Entry */}
      <div>
        <ToggleGroup
          type="single"
          value={formData.EntityType}
          onValueChange={(value) => setFormData({ ...formData, EntityType: value })}
          className="mt-2">
          <ToggleGroupItem value="task">Task</ToggleGroupItem>
          <ToggleGroupItem value="note">Note</ToggleGroupItem>
        </ToggleGroup>
      </div>
      

      {/* Details Field */}
      <div>
        <Label
          className="font-semibold"
          htmlFor="details">
          Details
        </Label>
        <Textarea
          id="details"
          value={formData.details}
          onChange={(e) =>
            setFormData({ ...formData, details: e.target.value })
          }
          placeholder="Enter details here..."
          className="mt-2"
        />
      </div>
      {/* Task Status (Only for Task) */}
      {formData.EntityType === "task" && (
        <div>
          <Label className="font-semibold">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => {
              setFormData({ ...formData, status: value });
              if (value !== "blocked") {
                setFormData({ ...formData, dependentOn: "" });
              }
            }}>
            <SelectTrigger>
              <SelectValue placeholder="Select status">
                {formData.status && (
                  <div className="flex items-center gap-2">
                    {
                      statusOptions.find((s) => s.value === formData.status)
                        ?.icon
                    }
                    {
                      statusOptions.find((s) => s.value === formData.status)
                        ?.label
                    }
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* "For" Field (Only for Task) */}
      {formData.EntityType === "task" && (
        <div>
          <Label className="font-semibold">For (optional)</Label>
          {formData.forWho && (
            <p className="text-sm text-gray-600">Selected: {formData.forWho}</p>
          )}
          <Command>
            <CommandInput placeholder="Search for a person..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Select a Person">
                {people.length > 0 ? (
                  people.map((person) => (
                    <CommandItem
                      key={person}
                      onSelect={() =>
                        setFormData({ ...formData, forWho: person })
                      }
                      className={
                        formData.forWho === person ? "bg-gray-200" : ""
                      }>
                      {person} {formData.forWho === person && "✅"}
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem disabled>No people available</CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="mt-2 flex gap-2">
            <Input
              value={customPerson}
              onChange={(e) => setCustomPerson(e.target.value)}
              placeholder="Add new person"
            />
            <Button
              onClick={addCustomPerson}
              type="button">
              Add
            </Button>
          </div>
        </div>
      )}
      {/* "Dependent On" Field (Only for Task) */}
      {/* Dependent On (Only if Task is Blocked) */}
      {formData.EntityType === "task" && formData.status === "blocked" && (
        <div>
          <Label className="font-semibold">Dependent On</Label>
          {formData.dependentOn && (
            <p className="text-sm text-gray-600">
              Selected: {formData.dependentOn}
            </p>
          )}
          <Command>
            <CommandInput placeholder="Search for a person..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Select a Person">
                {people.map((person) => (
                  <CommandItem
                    key={person}
                    onSelect={() =>
                      setFormData({ ...formData, dependentOn: person })
                    }
                    className={dependentOn === person ? "bg-gray-200" : ""}>
                    {person} {dependentOn === person && "✅"}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
      {formData.EntityType === "task" && (
        <div className="relative">
          <Label className="font-semibold">Due Date</Label>
          <Input
            type="date"
            id="due-date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="mt-2 pl-10"
          />
          <Calendar className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
        </div>
      )}

      {/* References (Dynamically Add Multiple) */}
      <div>
        <div className="flex justify-between">
          <Label className="font-semibold">References</Label>
          <Button
            type="button"
            variant="outline"
            onClick={addRefField}
            className="mt-2">
            Add
          </Button>
        </div>
        {formData.refs.map((ref, index) => (
          <div
            key={index}
            className="flex items-center gap-2 mt-2">
            <Input
              id={`ref-${index}`} // Unique ID for each input
              type="url"
              value={ref}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  refs: formData.refs.map((r, i) =>
                    i === index ? e.target.value : r
                  ),
                })
              }
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                setFormData({
                  ...formData,
                  refs: formData.refs.filter((_, i) => i !== index),
                })
              }>
              ✕
            </Button>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
    </div>
  );
}
