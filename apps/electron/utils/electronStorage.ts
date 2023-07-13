import electronStorage from "electron-json-storage";
import { Pages } from "../preloads/addPagePreload";

export type WindowPosition = {
  x: number;
  y: number;
};

export type WindowPositions = {
  [key: string]: WindowPosition;
};

export type WindowBoolean = {
  [key: string]: boolean;
};

export type WindowSize = {
  width: number;
  height: number;
};

export type WindowSizes = {
  [key: string]: WindowSize;
};

export type DesktopWebOverlayerLocalStorage = {
  position: WindowPositions;
  size: WindowSizes;
  ignoreMouseEvent: WindowBoolean;
  enableMoveWindow: WindowBoolean;
  showBorder: WindowBoolean;
  urls: Pages;
  activeUrls: string[];
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
