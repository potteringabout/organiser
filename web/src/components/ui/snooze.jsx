import { useState } from "react";
import { AlarmClock } from "lucide-react";
import { DayPicker } from "react-day-picker";
import 'react-day-picker/dist/style.css';

export default function SnoozeButton({ onSnooze, initialDate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-blue-600 hover:text-blue-800"
        title="Snooze until..."
      >
        <AlarmClock size={16} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 right-0 bg-white border rounded shadow p-2">
          <DayPicker
            mode="single"
            selected={initialDate}
            onSelect={(date) => {
              if (date) {
                onSnooze(date);
                setOpen(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}