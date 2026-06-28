import React from "react";
import { Toaster } from "react-hot-toast";
import { TaskProvider } from "./context/TaskContext";
import Home from "./pages/Home";
import "./App.css";

export default function App() {
  return (
    <TaskProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#111827",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          },
          success: { iconTheme: { primary: "#00d4aa", secondary: "#050c10" } },
          error:   { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
          loading: { iconTheme: { primary: "#818cf8", secondary: "#fff" } },
        }}
      />
      <Home />
    </TaskProvider>
  );
}
