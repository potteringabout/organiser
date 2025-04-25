import { useEffect, useState } from "react";
import { getBoards } from "@/organiser/store/client";
import { useSidebarStore } from "@/organiser/store/sidebar";

function useMenuItems() {
  const [menuItems, setMenuItems] = useState([]);
  const reloadTrigger = useSidebarStore((state) => state.reloadTrigger);

  useEffect(() => {
    async function loadMenuItems() {
      const data = await getBoards();
      setMenuItems(data || []);
    }
    loadMenuItems();
  }, [reloadTrigger]);

  return menuItems;
}

export default useMenuItems;