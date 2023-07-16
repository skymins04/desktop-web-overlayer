import path from "path";

export const title = "Desktop Web Overlayer";
export const version = `v1.0.0`;
export const titleVersion = `${title} - ${version}`;
export const logoImagePath = path.resolve(__dirname, "icon.png");

/**
 * Base Paths
 */

export const DesktopWebOverlayerRootDirPath = __dirname;
export const DesktopWebOverlayerViewDirPath = process.env.DEBUG
  ? "http://localhost:5173#"
  : "https://desktop-web-overlayer.betaman.xyz#";

/**
 * Page Routing Path
 */

export const DesktopWebOverlayerIndexHTMLPath = path.join(
  DesktopWebOverlayerViewDirPath,
  "overlay"
);
export const DesktopWebOverlayerSettingsHTMLPath = path.join(
  DesktopWebOverlayerViewDirPath,
  "settings"
);
export const DesktopWebOverlayerSettingsAddOverlayHTMLPath = path.join(
  DesktopWebOverlayerViewDirPath,
  "settings?menu=addOverlay"
);

/**
 * Preload File Path
 */

export const DesktopWebOverlayerOverlayPreloadJsPath = path.join(
  DesktopWebOverlayerRootDirPath,
  "preloads",
  "overlayPreload.js"
);
export const DesktopWebOverlayerSettingsPreloadJsPath = path.join(
  DesktopWebOverlayerRootDirPath,
  "preloads",
  "settingsPreload.js"
);
