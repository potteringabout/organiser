"use client";
import "../globals.css";
import { useSidebarStore } from "@/store/sidebar"
import Link from "next/link";
import { useDarkMode } from "../contexts";
import { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import { AddButton } from "../../components/ui/button";

import { getBoards } from "../client";

function SideBar() {
  const [menuItems, setMenuItems] = useState([]);
  const reloadTrigger = useSidebarStore((state) => state.reloadTrigger)

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
    <div>
      <div className="flex justify-between">
        <h4 className="font-bold text-gray-800">Boards</h4>
        <AddButton href="/organiser/boards/new"/>
      </div>
      <ul>
        {menuItems.map((item) => (
          <li key={item.ID} className="mb-2">
            <Link href="boards/[slug]" as={`/organiser/boards/${item.ID}`}>
              {item.Name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OrganiserLayout({ children }) {
  const pathname = usePathname();
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (pathname === "/organiser") {
      redirect("/organiser/boards");
    }
  }, [pathname]);

  return (
    <div className="h-screen flex">
      <aside
        className={`h-screen w-64 p-4 transition-colors shadow-xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <SideBar />
      </aside>
      <main className={`flex-1 shadow-2xl p-6 overflow-auto ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>{children}</main>
    </div>
  );
}
