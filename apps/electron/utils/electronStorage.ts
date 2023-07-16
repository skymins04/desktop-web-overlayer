import electronStorage from "electron-json-storage";

export type Overlay = {
  title: string;
  url: string;
  customTheme: string;
  opacity: number;
  fontSize: number;
  isEnableFontSize: boolean;
};
export type Overlays = Record<string, Overlay>;

export type WindowPosition = {
  x: number;
  y: number;
};

export type WindowPositions = Record<string, WindowPosition>;

export type WindowBooleans = Record<string, boolean>;

export type WindowSize = {
  width: number;
  height: number;
};

export type WindowSizes = Record<string, WindowSize>;

export type DesktopWebOverlayerLocalStorage = {
  overlayPositions: WindowPositions;
  overlaySizes: WindowSizes;
  isIgnoreOverlayWindowMouseEvents: WindowBooleans;
  isEnableOverlayWindowMoves: WindowBooleans;
  isShowOverlayWindowBorders: WindowBooleans;
  overlays: Overlays;
  activeOverlayIds: string[];
};

export const getStorageValue = <
  T extends keyof DesktopWebOverlayerLocalStorage
>(
  key: T
) => electronStorage.getSync(key) as DesktopWebOverlayerLocalStorage[T];

export const setStorageValue = <
  T extends keyof DesktopWebOverlayerLocalStorage
>(
  key: T,
  value: DesktopWebOverlayerLocalStorage[T],
  cb?: () => void
) => {
  if (cb) electronStorage.set(key, value, cb);
  else electronStorage.set(key, value, () => {});
};
