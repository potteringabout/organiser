import Menu from "./Menu";
import Main from "./Main";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useOrganiserStore from "@/organiser/store/organiserStore";
import { Bug, RefreshCw } from 'lucide-react'


function Organiser() {

  const { type, id } = useParams();
  const { setMenu } = useOrganiserStore();
  const loadBoards = useOrganiserStore((s) => s.loadBoards)
  
  useEffect(() => {
    setMenu(type);
    loadBoards();
  }, [type]);
  
  return (
    <div className="h-screen flex">
      <Menu/>
      <Main/>
      <DevTools/>
    </div>
  );
}




function DevTools() {
  const loadFakeData = useOrganiserStore((s) => s.loadFakeData)
  const resetStore = useOrganiserStore((s) => s.resetStore)

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-xl p-4 shadow-lg z-50 space-y-2">
      <div className="flex items-left space-x-2">
        <Bug size={16} />
        <span className="font-semibold">Dev Tools</span>
      </div>
      <button
        onClick={loadFakeData}
        className="w-full text-left px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
      >
        Load Fake Data
      </button>
      <button
        onClick={resetStore}
        className="w-full text-left px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center space-x-2"
      >
        <RefreshCw size={14} />
        <span>Reset Store</span>
      </button>
    </div>
  )
}

export default Organiser;