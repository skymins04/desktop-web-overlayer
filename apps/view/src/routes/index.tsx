import { Overlay } from "./Overlay";
import { Settings } from "./Settings";

export const router = [
  {
    path: "/overlay",
    element: <Overlay />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
];
