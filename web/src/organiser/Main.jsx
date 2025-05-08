import { Outlet } from "react-router-dom";

function Main() {
  return (
    <main className="flex-1 shadow-2xl p-6 overflow-auto">
      <Outlet/> 
    </main>
  );
}

export default Main;