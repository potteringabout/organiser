"use client";
import { createBoard } from "../../../client";
import { useState } from "react";
import { useRouter } from "next/navigation";
//import { useAlert } from "../../../contexts";
import { showAlert } from "@/app/utils/alertEmitter";

export default function CreateBoardPage() {

  const router = useRouter();
  //const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setCreating(true);
    setError(null);

    try {
      
      createBoard(formData.name, formData.description)
      .then(() => {
        console.log("Created board");
        showAlert("Board created successfully");
        router.push("/organiser/boards"); 
        router.refresh();
      })
      .catch((error) => {
        console.error("Error:", error.message);
        showAlert("Error creating board", "error");
      }); // Show success message

      // Reset the form
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Create a New Board
        </h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter board name"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter board description"
              rows="3"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition disabled:bg-gray-400"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create Board"}
          </button>
        </form>
      </div>
    </div>
  );
}