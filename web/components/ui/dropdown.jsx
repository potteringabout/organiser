"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Loader2, CheckCircle, Ban, Trash2, ChevronDown } from "lucide-react";


export default function FancyDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Select an option"); // Persist selection
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = ["Option 1", "Option 2", "Option 3"];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-lg font-medium text-gray-700 hover:text-black transition"
      >
        {selected} <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown Content */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-gray-300"
        >
          <ul className="py-2">
            {options.map((option, index) => (
              <li
                key={index}
                className={`px-4 py-2 text-gray-800 cursor-pointer transition ${
                  selected === option ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setSelected(option); // Persist selected option
                  setOpen(false); // Close dropdown
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

export function StatusDropdown({ onDelete }) {
  const [selectedStatus, setSelectedStatus] = useState("todo");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const statuses = [
    { id: "todo", label: "To-Do", icon: <ClipboardList className="w-5 h-5 text-gray-500" /> },
    { id: "in-progress", label: "In Progress", icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> },
    { id: "done", label: "Done", icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    { id: "blocked", label: "Blocked", icon: <Ban className="w-5 h-5 text-red-500" /> },
    { id: "delete", label: "Delete", icon: <Trash2 className="w-5 h-5 text-gray-500" /> }
  ];

  const currentStatus = statuses.find((s) => s.id === selectedStatus);

  return (
    <div className="relative inline-block w-48">
      {/* Dropdown Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex justify-between items-center w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-100 transition"
      >
        <div className="flex items-center space-x-2">
          {currentStatus.icon}
          <span className="text-gray-700">{currentStatus.label}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50">
          {statuses.map((status) => (
            <button
              key={status.id}
              className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 transition ${
                status.id === "delete" ? "text-red-600 font-bold" : ""
              }`}
              onClick={() => {
                if (status.id === "delete") {
                  if (onDelete) onDelete();
                } else {
                  setSelectedStatus(status.id);
                }
                setDropdownOpen(false);
              }}
            >
              {status.icon}
              <span className="ml-2">{status.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}