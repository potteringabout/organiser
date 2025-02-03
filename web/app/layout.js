"use client";

import "./globals.css";
import { useAuth, AuthProvider, LoginForm, LogoutButton } from "./auth";
import { DarkModeProvider, useDarkMode } from "@/app/contexts";
import FloatingAlert from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";

import { useState, useEffect } from "react";
//import { motion } from 'framer-motion';

function TopBar() {
  const { darkMode, setDarkMode } = useDarkMode();
  const menuItems = [
    { name: "Organiser", path: "/organiser" },
    { name: "Recipes", path: "/recipes" },
    { name: "About", path: "/about" },
  ];

  return (
    <header
      className={`h-14 w-full bg-blue-500 text-white flex items-center px-4 shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-md`}
    >
      <div className="flex items-center">
        <Image src="/mug.png" width="40" height="49" alt="Logo" className="mr-2" />
        <h1 className="text-xl font-semibold">potteringabout</h1>
      </div>
      <nav className="flex-1 flex justify-center space-x-4">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <LogoutButton />
      </div>
    </header>
  );
}


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#BBB2A9]">
      <body className="bg-[#BBB2A9] h-screen w-full flex flex-col">
      <AuthProvider>
        <DarkModeProvider>
          <BodyWithAuthCheck>{children}</BodyWithAuthCheck>
        </DarkModeProvider>
      </AuthProvider>
      </body>
    </html>
  );
}

function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      Loading...
    </div>
  );
}

function Login() {
  return (
      <div className="flex">
        <LoginForm />
      </div>
  );
}

function Body({ children }) {
  const { darkMode, setDarkMode } = useDarkMode();

  useEffect(() => {
    console.log("Main : Dark mode changed to " + darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
      <div
        className={`${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
          <TopBar darkMode={darkMode} setDarkMode={setDarkMode} />
          <div className="flex flex-1">
            {children}
          </div>
      </div>
  );
}

function BodyWithAuthCheck({ children }) {
  const { authChecked, isLoggedIn } = useAuth();
  //const { isLoggedIn } = useAuth();
  if (!authChecked) {
    return <Loading />;
  }

  return isLoggedIn ? <Body>{children}<FloatingAlert /></Body> : <Login />;
}
