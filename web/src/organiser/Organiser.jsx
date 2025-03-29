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
      <Menu />
      <Main />
    </div>
  );
}

export default Organiser;