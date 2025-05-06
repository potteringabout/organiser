import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { useBoards } from "@/organiser/store/useBoards";




function Menu() {
  const { boards, fetchBoards } = useBoards();
  const [loaded, setLoaded] = useState(false);


  useEffect(() => {
    fetchBoards()
    setLoaded(true)
  }, [loaded])

  const [isOpen, setIsOpen] = useState(true);
  
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
        <h4 className="font-bold mb-2">Boards</h4>
        {boards.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <LoaderCircle className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <ul>
          {boards.map((item) => (
            <li key={item.id} className="mb-2">
              <Link to={`/organiser/boards/${item.id}`} className="hover:underline">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </aside>
  );
}

export default Menu;