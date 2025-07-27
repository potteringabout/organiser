import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash, Menu as MenuIcon, LoaderCircle, X as CloseIcon } from "lucide-react";
import { useBoards } from "@/organiser/store/useBoards";
import { showAlert } from "@/components/ui/alert";


function Menu() {
  const { boards, fetchBoards, deleteBoard } = useBoards();
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate();

  const handleCreateBoard = () => {
    showAlert("Board created successfully!", "success");
    console.log("Creating board");
    navigate("/organiser/board/new");

  }


  useEffect(() => {
    fetchBoards()
    setLoaded(true)
  }, [loaded])

  if (!isOpen) {
    return (
      <div className="w-8 pl-4 pt-8 flex-shrink-0">
        <button onClick={() => setIsOpen(true)}>
          <MenuIcon size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside className="h-screen w-64 p-4 pr-8 transition-colors shadow-xl relative bg-white dark:bg-gray-800">
      {/* Collapse button */}
      <button className="absolute top-2 right-2 p-1 z-10" onClick={() => setIsOpen(false)}>
        <CloseIcon size={16} />
      </button>

      <div className="mt-6"> {/* Adds top margin so content doesn't clash with CloseIcon */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold">Boards</h4>
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={handleCreateBoard}
          >
            <Plus size={16} />
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <LoaderCircle className="animate-spin text-gray-500" size={24} />
          </div>
        ) : (
          <ul>
            {boards.map((item) => (
              <li key={item.id} className="mb-4">
                <div className="font-semibold truncate">{item.title}</div>
                <div className="ml-4 mt-1 space-y-1">
                  <Link to={`/organiser/board/${item.id}`} className="block hover:underline text-sm">
                    Board
                  </Link>
                  <Link to={`/organiser/boarddiary/${item.id}`} className="block hover:underline text-sm">
                    Diary
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default Menu;