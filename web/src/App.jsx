import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { Menu, X as CloseIcon } from "lucide-react";
import "./App.css"; // Ensure your Tailwind imports are here
import { useAuth, AuthProvider, LoginForm, LogoutButton } from "./Auth";
import FloatingAlert from "@/components/ui/alert";
import Organiser from "./organiser/Organiser";
import Home from "./Home";
import useOrganiserStore from "./organiser/store/organiserStore";

import Board from "./organiser/Board";
import NewTaskForm from "./organiser/NewTaskForm";
import NewBoardForm from "./organiser/NewBoardForm";
import NewNoteForm from "./organiser/NewNoteForm";
import NewMeetingForm from "./organiser/NewMeetingForm";
import Task from "./organiser/Task";
import Meeting from "./organiser/Meeting";
//import EditTaskForm from "./organiser/EditTaskForm";

function TopBar() {
  const { darkMode, setDarkMode } = useOrganiserStore();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Organiser", path: "/organiser" },
  ];

  return (
    <header
      className="h-14 w-full flex items-center px-4 pl-12 shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md">
      <div className="flex items-center w-full">
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
      </div>
    </header>
  );
}

function App() {
  const { darkMode } = useOrganiserStore();
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    console.log("SETTING DARK MODE", darkMode);
  }, [darkMode]);

  return (
    <Router>
    <AuthProvider>
      <BodyWithAuthCheck>        
          <div className="flex flex-col min-h-screen">
            {showHeader ? (
              <CloseIcon size={16}
                className="absolute top-2 left-2 z-50 cursor-pointer"
                onClick={() => setShowHeader(false)}
              />
            ) : (
              <Menu
                className="absolute top-2 left-2 z-50 cursor-pointer"
                onClick={() => setShowHeader(true)}
              />
            )}
            <div
              >
              {showHeader && <TopBar />}
              <main className="p-4 pl-0 pt-0">
                <Routes>
                  <Route
                    path="/"
                    element={<Home />}
                  />
                  <Route path="/organiser" element={<Organiser />}>
                    <Route index element={<Board />} />
                    <Route path="board/:boardId" element={<Board />} />
                    <Route path="board/:boardId/task/new" element={<NewTaskForm />} />
                    <Route path="meeting/new" element={<NewMeetingForm />} />
                    <Route path="note/new" element={<NewNoteForm />} />
                    <Route path="board/new" element={<NewBoardForm />} />
                    <Route path="task/:taskId" element={<Task />} />
                    <Route path="meeting/:meetingId" element={<Meeting />} />
                    {/* <Route path="task/:taskId/edit" element={<EditTaskForm />} />*/}
                  </Route>
                </Routes>
              </main>
            </div>
          </div>
      </BodyWithAuthCheck>
    </AuthProvider>
    </Router>
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
