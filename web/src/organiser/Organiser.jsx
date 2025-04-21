import Menu from "./Menu";
import Main from "./Main";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import useOrganiserStore from "@/organiser/store/organiserStore";


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