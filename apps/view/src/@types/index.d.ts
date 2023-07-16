export type Overlay = {
  title: string;
  url: string;
  customTheme?: string;
  opacity: number;
  fontSize: number;
  isEnableFontSize: boolean;
};
export type Overlays = Record<string, Overlay>;

declare global {
  interface Window {
    addWebOverlay: (overlay: Overlay) => void;
    updateWindowPosAndSize: () => void;
    closeOverlayWindow: () => void;
    addGetOverlayListListener: (
      cb: (overlays: Overlays, activeOverlayIds: string[]) => void
    ) => void;
    removeGetOverlayListListener: (
      cb: (overlays: Overlays, activeOverlayIds: string[]) => void
    ) => void;
    getOverlayListListeners: Record<
      string,
      (overlays: Overlays, activeOverlayIds: string[]) => void
    >;
    getOverlayList: () => void;
    deleteOverlayById: (overlayId: string) => void;
    editOverlay: (overlayId: string, overlay: Overlay) => void;
    openOverlayById: (overlayId: string) => void;
    closeOverlayById: (overlayId: string) => void;
    reloadOverlayById: (overlayId: string) => void;
    urlId: string;
    title: string;
    url: string;
  }
}
