"use client";
import "../globals.css";
import Link from "next/link";
import { useDarkMode } from "../contexts";
import FancyDropdown from "../../components/ui/dropdown";

import { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import { AddButton } from "../../components/ui/button";

import { getBoards } from "../client";
import { m } from "framer-motion";

function SideBar() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    async function loadMenuItems() {
      const data = await getBoards();
      // Assuming `data` is an array with objects containing `name` and `path`
      setMenuItems(data || []);
    }
    loadMenuItems();
  }, []);

  return (
    <div>
      <h2>
        Boards
        <AddButton href="/organiser/boards/new"/>
      </h2>
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
    <div>
      <aside
        className={`w-50 p-6 transition-colors fixed top-16 left-0 h-full ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <SideBar />
      </aside>
      <main className="flex flex-1 p-6 overflow-auto mt-16">{children}</main>
    </div>
  );
}
