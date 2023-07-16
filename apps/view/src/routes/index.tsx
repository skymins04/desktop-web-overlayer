import { createBrowserRouter } from "react-router-dom";
import { Overlay } from "./Overlay";
import { Settings } from "./Settings";
import { CheckUpdate } from "./CheckUpdate";

export const router = createBrowserRouter([
  {
    path: "/overlay",
    element: <Overlay />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/check-update",
    element: <CheckUpdate />,
  },
]);
