import path from "path";

export const DesktopWebOverlayerRootDirPath = path.resolve(__dirname, "..");
export const DesktopWebOverlayerStaticDirPath = path.resolve(
  DesktopWebOverlayerRootDirPath,
  "static"
);
export const DesktopWebOverlayerPreloadDirPath = path.resolve(
  DesktopWebOverlayerRootDirPath,
  "preloads"
);
export const DesktopWebOverlayerViewDirPath = process.env.DEBUG
  ? "http://localhost:5173"
  : "https://desktop-web-overlayer.betaman.xyz";
