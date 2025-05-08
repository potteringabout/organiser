import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import "./App.css"; // Ensure your Tailwind imports are here
import { useAuth, AuthProvider, LoginForm, LogoutButton } from "./Auth";
import FloatingAlert from "@/components/ui/alert";
import Organiser from "./organiser/Organiser";
import Home from "./Home";
import useOrganiserStore from "./organiser/store/organiserStore";

import Board from "./organiser/Board";
import NewTaskForm from "./organiser/NewTaskForm";
import NewBoardForm from "./organiser/NewBoardForm";
//import EditTaskForm from "./organiser/EditTaskForm";

function TopBar() {
  const { darkMode, setDarkMode } = useOrganiserStore();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Organiser", path: "/organiser" },
  ];

  return (
    <header
      className="h-14 w-full flex items-center px-4 shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md">
      
      <div className="flex items-center">
        <img
          src="/mug.png"
          width="40"
          height="49"
          alt="Logo"
        />
        <h1 className="text-xl font-bold">
          potteringabout
        </h1>
      </div>
      <nav className="flex-1 flex justify-center space-x-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="hover:underline">
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full transition-colors">
          {darkMode ? "☀️" : "🌙"}
        </button>
        <LogoutButton />
      </div>
    </header>
  );
}

function App() {
  const { darkMode } = useOrganiserStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    console.log("SETTING DARK MODE", darkMode);
  }, [darkMode]);

  return (
    <AuthProvider>
      <BodyWithAuthCheck>
        <Router>
          <div className="flex flex-col min-h-screen">
            <div
              >
              <TopBar />
              <main className="p-4 pt-0">
                <Routes>
                  <Route
                    path="/"
                    element={<Home />}
                  />
                  <Route path="/organiser" element={<Organiser />}>
                    <Route index element={<Board />} />
                    <Route path="board/:boardId" element={<Board />} />
                    <Route path="task/new" element={<NewTaskForm />} />
                    <Route path="board/new" element={<NewBoardForm />} />
                    {/* <Route path="task/:taskId/edit" element={<EditTaskForm />} />*/}
                  </Route>
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </BodyWithAuthCheck>
    </AuthProvider>
  );
}

function Login() {
  return (
    <div className="flex">
      <LoginForm />
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">Loading...</div>
  );
}

function Body({ children }) {
  
  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {children}
    </div>
  );
}

function BodyWithAuthCheck({ children }) {
  const { authChecked, isLoggedIn } = useAuth();
  //const { isLoggedIn } = useAuth();
  if (!authChecked) {
    return <Loading />;
  }

  return isLoggedIn ? (
    <Body>
      {children}
      <FloatingAlert />
    </Body>
  ) : (
    <Login />
  );
}

export default App;
