import path from "path";

export const title = "Desktop Web Overlayer";
export const version = `v1.0.1`;
export const titleVersion = `${title} - ${version}`;
export const logoImagePath = path.resolve(__dirname, "icon.png");

/**
 * Base Paths
 */

export const DesktopWebOverlayerRootDirPath = __dirname;
export const DesktopWebOverlayerViewDirPath = process.env.DEBUG
  ? "http://localhost:5173"
  : "https://desktop-web-overlayer.betaman.xyz";

/**
 * Page Routing Path
 */

export const DesktopWebOverlayerCheckUpdateHTMLPath = path.join(
  DesktopWebOverlayerViewDirPath,
  "check-update"
);
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

export const DesktopWebOverlayerPreloadJsPath = path.join(
  DesktopWebOverlayerRootDirPath,
  "preload.js"
);

export const IpcEventKeys = {
  AddWebOverlay: "add-web-overlay",
  GetWebOverlayList: "get-web-overlay-list",
  DeleteWebOverlay: "delete-web-overlay",
  EditWebOverlay: "edit-web-overlay",
  OpenWebOverlay: "open-web-overlay",
  CloseWebOverlay: "close-web-overlay",
  ReloadWebOverlay: "reload-web-overlay",
  UpdateIframePositionSize: "update-iframe-pos-size",
  InitWebOverlay: "init-web-overlay",
  ShowBorderWebOverlay: "show-border-web-overlay",
  IgnoreMouseEventWebOverlay: "ignore-mouse-event-web-overlay",
  EnableMoveWebOverlay: "enable-move-web-overlay",
  SetIframeUrlWebOverlay: "set-iframe-url-web-overlay",
};
