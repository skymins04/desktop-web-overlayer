import { ipcRenderer } from "electron";
import { Overlay, Overlays } from "../utils";

declare global {
  interface Window {
    addWebOverlay: (overlay: Overlay) => void;
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
  }
}

window.addWebOverlay = (overlay) => {
  const trimedOverlay: Overlay = {
    ...overlay,
    title: overlay.title.trim(),
    url: overlay.url.trim(),
  };
  ipcRenderer.send("add-web-overlay", trimedOverlay);
};

window.getOverlayListListeners = {};

window.addGetOverlayListListener = (cb) => {
  window.getOverlayListListeners[cb.name] = cb;
};

window.removeGetOverlayListListener = (cb) => {
  if (window.getOverlayListListeners[cb.name]) {
    delete window.getOverlayListListeners[cb.name];
  }
};

window.getOverlayList = () => {
  ipcRenderer.send("get-web-overlay-list");
};

window.openOverlayById = (overlayId) => {
  ipcRenderer.send("open-overlay", overlayId);
};

window.closeOverlayById = (overlayId) => {
  ipcRenderer.send("close-overlay", overlayId);
};

window.reloadOverlayById = (overlayId) => {
  ipcRenderer.send("reload-overlay", overlayId);
};

ipcRenderer.on(
  "get-web-overlay-list",
  (e, overlays: Overlays, activeOverlayIds: string[]) => {
    console.log("????????");
    for (const [, listener] of Object.entries(window.getOverlayListListeners)) {
      listener(overlays, activeOverlayIds);
    }
  }
);

window.deleteOverlayById = (overlayId) => {
  ipcRenderer.send("delete-overlay", overlayId);
};

window.editOverlay = (overlayId, overlay) => {
  ipcRenderer.send("edit-overlay", overlayId, overlay);
};
