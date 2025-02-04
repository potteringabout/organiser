"use client"; 
import React from "react";
import { Trash2, Plus, Check } from "lucide-react";

export const Button = ({ className = "", children, onClick, variant = "primary", ...props }) => {
  const baseStyles = "px-4 py-2 font-semibold rounded-lg transition duration-200 focus:outline-none";

  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    ghost: "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export function DeleteButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-700 transition"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export function AddButton({ href }) {
  return (
    <a
      href={href}
      className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-700 transition"
    >
      <Plus className="w-4 h-4" />
    </a>
  );
}

export function TickButton({ onClick }) {
  return (
    <button
      id="tick-button"
      onClick={() => {
        onClick(); 
      }}
      className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-700 transition"
    >
      <Check className="w-4 h-4" />
    </button>
  );
}