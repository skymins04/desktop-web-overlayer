import { app } from "electron";
import electronStorage from "electron-json-storage";

export type WindowBooleans = Record<string, boolean>;

export type WindowPosition = {
  x: number;
  y: number;
};

export type WindowPositions = Record<string, WindowPosition>;

export type WindowSize = {
  width: number;
  height: number;
};

export type WindowSizes = Record<string, WindowSize>;

export type Overlay = {
  title: string;
  url: string;
  customTheme: string;
  opacity: number;
  fontSize: number;
  isEnableFontSize: boolean;
};
export type Overlays = Record<string, Overlay>;
export type ExportedOverlay = {
  overlayPosition: WindowPosition;
  overlaySize: WindowSize;
  isIgnoreOverlayWindowMouseEvent: boolean;
  isEnableOverlayWindowMove: boolean;
  isShowOverlayWindowBorder: boolean;
} & Overlay;
export type ExportedOverlays = {
  overlays: Record<string, ExportedOverlay>;
  activeOverlayIds: string[];
};

export type DesktopWebOverlayerLocalStorage = {
  overlayPositions: WindowPositions;
  overlaySizes: WindowSizes;
  isIgnoreOverlayWindowMouseEvents: WindowBooleans;
  isEnableOverlayWindowMoves: WindowBooleans;
  isShowOverlayWindowBorders: WindowBooleans;
  overlays: Overlays;
  activeOverlayIds: string[];
  settingFileHistory: string[];
};

class _StoreModule {
  constructor() {
    app.on("ready", () => {
      this.init();
    });
  }

  private _overlays: Overlays = {};
  get overlays() {
    return this._overlays;
  }
  set overlays(value: Overlays) {
    this._overlays = value;
    this.storeSet("overlays", value);
  }
  private _activeOverlayIds: string[] = [];
  get activeOverlayIds() {
    return this._activeOverlayIds;
  }
  set activeOverlayIds(value: string[]) {
    this._activeOverlayIds = value;
    this.storeSet("activeOverlayIds", value);
  }
  private _overlayWindowSizes: WindowSizes = {};
  get overlayWindowSizes() {
    return this._overlayWindowSizes;
  }
  set overlayWindowSizes(value: WindowSizes) {
    this._overlayWindowSizes = value;
    this.storeSet("overlaySizes", value);
  }
  private _overlayWindowPositions: WindowPositions = {};
  get overlayWindowPositions() {
    return this._overlayWindowPositions;
  }
  set overlayWindowPositions(value: WindowPositions) {
    this._overlayWindowPositions = value;
    this.storeSet("overlayPositions", value);
  }
  private _isIgnoreOverlayWindowMouseEvents: WindowBooleans = {};
  get isIgnoreOverlayWindowMouseEvents() {
    return this._isIgnoreOverlayWindowMouseEvents;
  }
  set isIgnoreOverlayWindowMouseEvents(value: WindowBooleans) {
    this._isIgnoreOverlayWindowMouseEvents = value;
    this.storeSet("isIgnoreOverlayWindowMouseEvents", value);
  }
  private _isEnableOverlayWindowMoves: WindowBooleans = {};
  get isEnableOverlayWindowMoves() {
    return this._isEnableOverlayWindowMoves;
  }
  set isEnableOverlayWindowMoves(value: WindowBooleans) {
    this._isEnableOverlayWindowMoves = value;
    this.storeSet("isEnableOverlayWindowMoves", value);
  }
  private _isShowOverlayWindowBorders: WindowBooleans = {};
  get isShowOverlayWindowBorders() {
    return this._isShowOverlayWindowBorders;
  }
  set isShowOverlayWindowBorders(value: WindowBooleans) {
    this._isShowOverlayWindowBorders = value;
    this.storeSet("isShowOverlayWindowBorders", value);
  }
  private _settingFileHistory: string[] = [];
  get settingFileHistory() {
    return this._settingFileHistory;
  }
  set settingFileHistory(value: string[]) {
    this._settingFileHistory = value;
    this.storeSet("settingFileHistory", value);
  }

  private init() {
    const overlays = this.storeGet("overlays");
    this._overlays = typeof overlays === "object" ? overlays : {};

    const activeOverlayIds = this.storeGet("activeOverlayIds");
    this._activeOverlayIds = (
      Array.isArray(activeOverlayIds) ? activeOverlayIds : []
    ).filter((activeOverlayId) => !!this._overlays[activeOverlayId]);

    const overlayPositions = this.storeGet("overlayPositions");
    this._overlayWindowPositions =
      typeof overlayPositions === "object" ? overlayPositions : {};

    const overlaySizes = this.storeGet("overlaySizes");
    this._overlayWindowSizes =
      typeof overlaySizes === "object" ? overlaySizes : {};

    const isIgnoreOverlayWindowMouseEvents = this.storeGet(
      "isIgnoreOverlayWindowMouseEvents"
    );
    this._isIgnoreOverlayWindowMouseEvents =
      typeof isIgnoreOverlayWindowMouseEvents === "object"
        ? isIgnoreOverlayWindowMouseEvents
        : {};

    const isEnableOverlayWindowMoves = this.storeGet(
      "isEnableOverlayWindowMoves"
    );
    this._isEnableOverlayWindowMoves =
      typeof isEnableOverlayWindowMoves === "object"
        ? isEnableOverlayWindowMoves
        : {};

    const isShowOverlayWindowBorders = this.storeGet(
      "isShowOverlayWindowBorders"
    );
    this._isShowOverlayWindowBorders =
      typeof isShowOverlayWindowBorders === "object"
        ? isShowOverlayWindowBorders
        : {};

    const settingFileHistory = this.storeGet("settingFileHistory");
    this._settingFileHistory = Array.isArray(settingFileHistory)
      ? settingFileHistory.filter((itm) => typeof itm === "string")
      : [];
  }

  private storeGet = <T extends keyof DesktopWebOverlayerLocalStorage>(
    key: T
  ) => electronStorage.getSync(key) as DesktopWebOverlayerLocalStorage[T];

  private storeSet = <T extends keyof DesktopWebOverlayerLocalStorage>(
    key: T,
    value: DesktopWebOverlayerLocalStorage[T],
    cb?: () => void
  ) => {
    if (cb) electronStorage.set(key, value, cb);
    else electronStorage.set(key, value, () => {});
  };
}

export const StoreModule = new _StoreModule();
export type StoreModule = typeof StoreModule;
