"use client"; 
import React from "react";

export const Input = ({ type = "text", className = "", ...props }) => {
  return (
    <input
      type={type}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};