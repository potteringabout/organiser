"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBoard, deleteBoard } from '../../../client';
//import { useAlert } from '../../../contexts';
import { showAlert } from "@/app/utils/alertEmitter";
import { EditableTextArea } from "@/components/ui/editableText";
import { DeleteButton } from "@/components/ui/button";
import { StatusDropdown } from "@/components/ui/dropdown";
 
export default function Page() {
  const { slug } = useParams();
  //const { showAlert } = useAlert();
  const router = useRouter();

  const [board, setBoard] = useState({});

  function handleDelete() {
    deleteBoard(slug)
    .then(() => {
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
  getBoard(slug)
    .then((data) => setBoard(data))
    .catch((error) => console.error("Error:", error.message));
  }, [slug]);

  return (
    <div className="flex flex-1 col-1 h-screen">
      <div className="flex-1">
      <h1>Board: {board.Name}</h1>
      <p>Description: {board.Description}</p>
      <DeleteButton onClick={handleDelete}/>
      </div>
      <div className="flex-1">
      <EditableTextArea/>
      </div>
      <div className="flex-1">
        <StatusDropdown onDelete={handleDelete} />
      </div>
      <div className="flex-1">
      

    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Tailwind Grid Layout</h1>

      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Grid Items */}
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-blue-500 text-white p-6 rounded-lg shadow-md flex justify-center items-center text-lg font-bold"
          >
            Item {index + 1}
          </div>
        ))}
      </div>
    </div>
    </div>
    </div>
  ) 
}