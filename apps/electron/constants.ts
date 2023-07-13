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
  : "file://" + path.resolve(__dirname, "..", "view", "index.html#");

/**
 * Page Routing Path
 */

export const DesktopWebOverlayerIndexHTMLPath = path.join(
  DesktopWebOverlayerViewDirPath,
  "iframe"
);
export const DesktopWebOverlayerAddWebPageHTMLPath = path.join(
  DesktopWebOverlayerViewDirPath,
  "addPage"
);

/**
 * Preload File Path
 */

export const DesktopWebOverlayerIframePreloadJsPath = path.join(
  DesktopWebOverlayerRootDirPath,
  "preloads",
  "iframePreload.js"
);
export const DesktopWebOverlayerAddPagePreloadJsPath = path.join(
  DesktopWebOverlayerRootDirPath,
  "preloads",
  "addPagePreload.js"
);
