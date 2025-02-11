"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addUpdate, getBoard, deleteBoard, getTasks } from "../../../client";
//import { useAlert } from '../../../contexts';
import { showAlert } from "@/app/utils/alertEmitter";
import { EditableTextArea } from "@/components/ui/editableText";
import { DeleteButton } from "@/components/ui/button";
import { StatusDropdown } from "@/components/ui/dropdown";
import { useSidebarStore } from "@/store/sidebar"
import TaskOrNoteForm from "@/components/ui/taskOrNoteForm";
import {TaskBoard, TaskBoard2, TaskList} from "@/components/ui/tasks";
import { AddButton } from "@/components/ui/button";

export default function Page() {
	const { slug } = useParams();
	//const { showAlert } = useAlert();
	const router = useRouter();

	const [board, setBoard] = useState({});
  const reloadSidebar = useSidebarStore((state) => state.reloadSidebar)

  const [tasks, setTasks] = useState([]);

	function handlesubmission(text) {
		console.log(text);

		try {
			addUpdate(text)
				.then(() => {
					showAlert("Update added " + text);
					//router.push("/organiser/boards");
					//router.refresh();
				})
				.catch((error) => {
					console.error("Error:", error.message);
					showAlert("Error creating board", "error");
				}); // Show success message

			// Reset the form
			//setFormData({ name: "", description: "" });
		} catch (error) {
			console.error("Error:", error);
			setError("Something went wrong. Please try again.");
		} finally {
			//setCreating(false);
		}
	}

	function handleDelete() {
		deleteBoard(slug)
			.then(() => {
        reloadSidebar();
				console.log("Deleted board");
				showAlert("Board deleted successfully");
				//redirect("/organiser/boards");
				router.push("/organiser/boards");
				router.refresh();
			})
			.catch((error) => {
				console.error("Error:", error.message);
				showAlert("Error deleting board", "error");
			});
	}

	useEffect(() => {
    getTasks(slug)
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error:", error.message));
    getBoard(slug)
			.then((data) => setBoard(data))
			.catch((error) => console.error("Error:", error.message));
	}, [slug]);

	return (
		<div className="flex flex-col">
			<div className="flex flex-1 justify-between">
				<p>Board: {board.Name}</p>
				<p>Description: {board.Description}</p>
				<DeleteButton onClick={handleDelete} />
			</div>
			<div className="flex-1 p-4">
				<EditableTextArea
					defaultText="..."
					onSubmit={handlesubmission}
				/>
			</div>
      <div className="flex-1 p-4">
        <AddButton href={`/organiser/boards/${slug}/new`} />
      </div>
			<div className="flex-1">
        <TaskBoard2 tasks={tasks} />
      </div>
		</div>
	);
}
