import { useState } from "react";
import {
  ChevronDown,
  CheckCircle,
  Hourglass,
  Circle,
  Ban
} from "lucide-react";

const STATUSES = [
  { label: "Todo", value: "todo", icon: Circle },
  { label: "In Progress", value: "in_progress", icon: Hourglass },
  { label: "Blocked", value: "blocked", icon: Ban },
  { label: "Done", value: "done", icon: CheckCircle },
];

export default function StatusDropdown({ currentStatus, onChange }) {
  const [open, setOpen] = useState(false);

  const selected = STATUSES.find((s) => s.value === currentStatus);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-50"
      >
        {selected?.icon && <selected.icon size={16} />}
        {selected?.label}
        <ChevronDown size={16} className="ml-1" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
          {STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                onChange(status.value);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-gray-100 text-left"
            >
              <status.icon size={16} />
              {status.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}