import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import useMenuItems from "@/hooks/useMenuItems";

function Menu() {
  const [isOpen, setIsOpen] = useState(true);
  const menuItems = useMenuItems();

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
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-2">
              <Link to={`/organiser/boards/${item.id}`} className="hover:underline">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Menu;