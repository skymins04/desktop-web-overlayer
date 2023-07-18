export type Overlay = {
  title: string;
  url: string;
  customTheme?: string;
  opacity: number;
  fontSize: number;
  isEnableFontSize: boolean;
};
export type Overlays = Record<string, Overlay>;
export type WindowBooleans = Record<string, boolean>;

declare global {
  interface Window {
    addWebOverlay: (overlay: Overlay) => void;
    updateWindowPosAndSize: () => void;
    addGetOverlayListListener: (
      cb: (
        overlays: Overlays,
        activeOverlayIds: string[],
        isIgnoreOverlayWindowMouseEvents: WindowBooleans,
        isEnableOverlayWindowMoves: WindowBooleans,
        isShowOverlayWindowBorders: WindowBooleans
      ) => void
    ) => void;
    removeGetOverlayListListener: (
      cb: (
        overlays: Overlays,
        activeOverlayIds: string[],
        isIgnoreOverlayWindowMouseEvents: WindowBooleans,
        isEnableOverlayWindowMoves: WindowBooleans,
        isShowOverlayWindowBorders: WindowBooleans
      ) => void
    ) => void;
    getOverlayListListeners: Record<
      string,
      (
        overlays: Overlays,
        activeOverlayIds: string[],
        isIgnoreOverlayWindowMouseEvents: WindowBooleans,
        isEnableOverlayWindowMoves: WindowBooleans,
        isShowOverlayWindowBorders: WindowBooleans
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
    urlId: string;
    title: string;
    url: string;
  }
}
