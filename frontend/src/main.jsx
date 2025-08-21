// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css"; // create later or use existing styles

createRoot(document.getElementById("root")).render(<App />);
