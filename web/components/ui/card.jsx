"use client"; 
import React from "react";

export const Card = ({ className = "", children }) => {
  return (
    <div className={`p-6 rounded-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ className = "", children }) => {
  return <div className={`mt-4 ${className}`}>{children}</div>;
};