import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { router } from "./routes";
import "./styles/index.css";
import { Notifications } from "@mantine/notifications";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS withCSSVariables>
      <Notifications position="top-right" />
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
