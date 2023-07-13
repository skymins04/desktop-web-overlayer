import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { router } from "./routes";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS withCSSVariables>
      <HashRouter>
        <Routes>
          {router.map((route) => (
            <Route {...route} />
          ))}
        </Routes>
      </HashRouter>
    </MantineProvider>
  </React.StrictMode>
);
