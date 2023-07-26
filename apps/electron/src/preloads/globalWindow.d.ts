import { Overlay, Overlays, WindowBooleans } from "@modules";

declare global {
  interface Window {
    addWebOverlay: (overlay: Overlay) => void;
    addGetOverlayListListener: (
      cb: (
        overlays: Overlays,
        activeOverlayIds: string[],
        isIgnoreOverlayWindowMouseEvents: WindowBooleans,
        isEnableOverlayWindowMoves: WindowBooleans,
        isShowOverlayWindowBorders: WindowBooleans,
        settingFileHistory: string[]
      ) => void
    ) => void;
    removeGetOverlayListListener: (
      cb: (
        overlays: Overlays,
        activeOverlayIds: string[],
        isIgnoreOverlayWindowMouseEvents: WindowBooleans,
        isEnableOverlayWindowMoves: WindowBooleans,
        isShowOverlayWindowBorders: WindowBooleans,
        settingFileHistory: string[]
      ) => void
    ) => void;
    getOverlayListListeners: Record<
      string,
      (
        overlays: Overlays,
        activeOverlayIds: string[],
        isIgnoreOverlayWindowMouseEvents: WindowBooleans,
        isEnableOverlayWindowMoves: WindowBooleans,
        isShowOverlayWindowBorders: WindowBooleans,
        settingFileHistory: string[]
      ) => void
    >;
    getOverlayList: () => void;
    deleteOverlayById: (overlayId: string) => void;
    editOverlay: (overlayId: string, overlay: Overlay) => void;
    openOverlayById: (overlayId: string) => void;
    closeOverlayById: (overlayId: string) => void;
    reloadOverlayById: (overlayId: string) => void;
    toggleIgnoreOverlayWindowMouseEventById: (overlayId: string) => void;
    toggleEnableOverlayWindowMoveById: (overlayId: string) => void;
    toggleShowOverlayWindowBorderById: (overlayId: string) => void;
    exportOverlays: (
      cb: (result: "success" | "fail" | "cancel") => void
    ) => void;
    importOverlays: (
      cb: (result: "success" | "fail" | "cancel") => void,
      filePath?: string
    ) => void;
    deleteSettingHistory: (index: number) => void;
    updateWindowPosAndSize: () => void;
    urlId: string;
    title: string;
    url: string;
  }
}
