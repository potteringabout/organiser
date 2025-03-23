import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import "./App.css"; // Ensure your Tailwind imports are here
import { useAuth, AuthProvider, LoginForm, LogoutButton } from "./Auth";
import FloatingAlert from "@/components/ui/alert";
import Organiser from "./organiser/Organiser";
import Home from "./Home";
import useOrganiserStore from "./organiser/store/organiserStore";

function TopBar() {

  const { darkMode, setDarkMode } = useOrganiserStore();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Organiser", path: "/organiser" },
  ];

  return (
    <header
      className={`h-14 w-full bg-blue-500 flex items-center px-4 shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-md`}>
      <div className="flex items-center">
        <img
          src="/mug.png"
          width="40"
          height="49"
          alt="Logo"
        />
        <h1 className="text-xl font-bold text-gray-900">potteringabout</h1>
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
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors">
          {darkMode ? "☀️" : "🌙"}
        </button>
        <LogoutButton />
      </div>
    </header>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <AuthProvider>
      <BodyWithAuthCheck>
        <Router>
        <div className="flex flex-col min-h-screen">
          <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} `}>
            <TopBar/>
            <main className="p-4">
              <Routes>
                <Route
                  path="/"
                  element={<Home />}
                />
                <Route
                  path="/organiser"
                  element={<Organiser />}
                />
                <Route path="/organiser/:type/:id" element={<Organiser />} />
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
  return <div className={`bg-gray-100 text-gray-900`}>{children}</div>;
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
