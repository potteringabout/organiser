"use client";
import { useState, useRef } from "react";
import { useDarkMode } from "@/app/contexts";
import { TickButton } from "@/components/ui/button";

export function EditableTextArea({ defaultText = "Click to edit...", onSubmit }) {
	const { darkMode } = useDarkMode();
	const [text, setText] = useState(defaultText);
	const [isEditing, setIsEditing] = useState(false);
	const textAreaRef = useRef(null);

	// Handle input change
	const handleChange = (e) => {
		setText(e.target.value);
		autoResize(e.target);
	};

	// Auto-resize the textarea based on content
	const autoResize = (el) => {
		el.style.height = "auto"; // Reset height to recalculate
		el.style.height = el.scrollHeight + "px"; // Set new height
	};

	const handleSubmit = () => {
		console.log("submit" + text);
		setIsEditing(false);
    onSubmit(text);
	};

	// Handle entering edit mode
	const handleEdit = () => {
		setIsEditing(true);
		setTimeout(() => {
			if (textAreaRef.current) {
				textAreaRef.current.focus();
				autoResize(textAreaRef.current);
			}
		}, 0);
	};

	const handleBlur = (e) => {
		if (e.relatedTarget?.id === "tick-button") {
			return; // Don't close if tick button is clicked
		}
		setIsEditing(false);
	};

	return (
		<div className="w-full">
			{isEditing ? (
				<div className="justify-between flex items-center">
					<textarea
						ref={textAreaRef}
						value={text}
						onChange={handleChange}
						onBlur={handleBlur}
						rows="1"
						className={`w-full p-2 mr-4 border border-gray-300 rounded-md resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 ${
							darkMode ? "text-gray-900" : "text-gray-800"
						}`}
						style={{ minHeight: "40px" }}
					/>
					<TickButton onClick={handleSubmit} />
				</div>
			) : (
				<p
					onMouseDown={handleEdit}
					className="w-full p-2 cursor-text whitespace-pre-wrap border border-transparent rounded-md hover:border-gray-300">
					{text || "Click to edit..."}
				</p>
			)}
		</div>
	);
}
