import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash, Menu as MenuIcon, LoaderCircle, X as CloseIcon } from "lucide-react";
import { useBoards } from "@/organiser/store/useBoards";
import { showAlert } from "@/components/ui/alert";


function Menu() {
  const { boards, fetchBoards, addBoard, deleteBoard } = useBoards();
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
      <div className="w-8 pt-2 flex-shrink-0">
        <button onClick={() => setIsOpen(true)}>
          <MenuIcon size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside className="h-screen w-64 p-4 transition-colors shadow-xl relative bg-white dark:bg-gray-800">
      {/* Collapse button */}
      <button className="absolute top-2 right-2 p-1" onClick={() => setIsOpen(false)}>
        <CloseIcon size={16} />
      </button>
  
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold">Boards</h4>
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={handleCreateBoard} // define this function
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
              <li key={item.id} className="mb-2 flex items-center justify-between group">
                <Link
                  to={`/organiser/board/${item.id}`}
                  className="hover:underline truncate"
                >
                  {item.title}
                </Link>
                <button
                  className="p-1 ml-2 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                  onClick={() => deleteBoard(item.id)} // define this function
                >
                  <Trash size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default Menu;