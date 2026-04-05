import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 App starting...");
console.log("Env vars:", {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "✓ Loaded" : "✗ Missing",
});

const root = document.getElementById("root");
if (!root) {
  console.error("❌ Root element not found!");
  throw new Error("Root element not found");
}

console.log("✓ Root element found, rendering app...");
createRoot(root).render(<App />);
console.log("✓ App rendered");
