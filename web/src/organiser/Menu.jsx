import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBoards } from "@/organiser/store/client";
import { useSidebarStore } from "./store/sidebar";
import { Link } from "react-router-dom";
import useOrganiserStore from "./store/organiserStore";

function Menu() {
  const navigate = useNavigate();
  const { darkMode, menu } = useOrganiserStore();

  const { id } = useParams();

  const [menuItems, setMenuItems] = useState([]);
  const reloadTrigger = useSidebarStore((state) => state.reloadTrigger);

  useEffect(() => {
    async function loadMenuItems() {
      const data = await getBoards();
      // Assuming `data` is an array with objects containing `name` and `path`
      console.log(data);
      setMenuItems(data || []);
    }
    loadMenuItems();
  }, [reloadTrigger]);

  return (
    <aside
      className={`h-screen w-64 p-4 transition-colors shadow-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}>
      <div>
        <div className="flex justify-between">
          <h4 className="font-bold text-gray-800">Boards</h4>
        </div>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.ID}
              className="mb-2">
              <Link
                to={`/organiser/boards/${item.ID}`}
                className="hover:underline">
                {item.Name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Menu;
