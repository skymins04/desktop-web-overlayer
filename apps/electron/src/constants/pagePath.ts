import path from "path";
import {
  DesktopWebOverlayerStaticDirPath,
  DesktopWebOverlayerViewDirPath,
} from "./basePath";

/**
 * Electron Static Pages
 */

export const DesktopWebOverlayerCheckUpdateHTMLPath = path.join(
  DesktopWebOverlayerStaticDirPath,
  "checkUpdate.html"
);

/**
 * React Pages
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
