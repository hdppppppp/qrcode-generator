import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import "./index.css";

// 配置Toaster的默认设置
const toasterOptions = {
  position: "top-right",
  duration: 3000,
  closeButton: true
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster {...toasterOptions} />
    </BrowserRouter>
  </StrictMode>
);
