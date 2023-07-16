import { ipcRenderer } from "electron";
import { Overlay, Overlays } from "./utils";
import { IpcEventKeys } from "./constants";

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
    updateWindowPosAndSize: () => void;
    urlId: string;
    title: string;
    url: string;
  }
}

ipcRenderer.on(
  IpcEventKeys.InitWebOverlay,
  (e, urlId: string, url: string, title: string) => {
    window.updateWindowPosAndSize = () => {
      ipcRenderer.send("update-iframe-pos-size", urlId);
    };
    window.urlId = urlId;
    window.url = url;
    window.title = title;
  }
);

ipcRenderer.on(IpcEventKeys.ShowBorderWebOverlay, (e, isShow: boolean) => {
  if (isShow)
    document.getElementsByTagName("html")[0].classList.add("show-border");
  else document.getElementsByTagName("html")[0].classList.remove("show-border");
});

ipcRenderer.on(
  IpcEventKeys.IgnoreMouseEventWebOverlay,
  (e, isIgnore: boolean) => {
    if (isIgnore)
      document
        .getElementsByTagName("html")[0]
        .classList.add("ignore-mouse-event");
    else
      document
        .getElementsByTagName("html")[0]
        .classList.remove("ignore-mouse-event");
  }
);

ipcRenderer.on(IpcEventKeys.EnableMoveWebOverlay, (e, isEnabled: boolean) => {
  if (isEnabled)
    document.getElementsByTagName("html")[0].classList.add("draggable");
  else document.getElementsByTagName("html")[0].classList.remove("draggable");
});

ipcRenderer.on(IpcEventKeys.SetIframeUrlWebOverlay, (e, url: string) => {
  document.getElementById("iframe")?.setAttribute("src", url);
});

window.addEventListener("keydown", (e) => {
  if (e.which === 81 && e.shiftKey && e.ctrlKey)
    document.getElementsByTagName("html")[0].classList.add("show-border");
});

window.addEventListener("keyup", () => {
  document.getElementsByTagName("html")[0].classList.remove("show-border");
});

////////

window.addWebOverlay = (overlay) => {
  const trimedOverlay: Overlay = {
    ...overlay,
    title: overlay.title.trim(),
    url: overlay.url.trim(),
  };
  ipcRenderer.send(IpcEventKeys.AddWebOverlay, trimedOverlay);
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
  ipcRenderer.send(IpcEventKeys.GetWebOverlayList);
};

window.openOverlayById = (overlayId) => {
  ipcRenderer.send(IpcEventKeys.OpenWebOverlay, overlayId);
};

window.closeOverlayById = (overlayId) => {
  ipcRenderer.send(IpcEventKeys.CloseWebOverlay, overlayId);
};

window.reloadOverlayById = (overlayId) => {
  ipcRenderer.send(IpcEventKeys.ReloadWebOverlay, overlayId);
};

ipcRenderer.on(
  IpcEventKeys.GetWebOverlayList,
  (e, overlays: Overlays, activeOverlayIds: string[]) => {
    for (const [, listener] of Object.entries(window.getOverlayListListeners)) {
      listener(overlays, activeOverlayIds);
    }
  }
);

window.deleteOverlayById = (overlayId) => {
  ipcRenderer.send(IpcEventKeys.DeleteWebOverlay, overlayId);
};

window.editOverlay = (overlayId, overlay) => {
  ipcRenderer.send(IpcEventKeys.EditWebOverlay, overlayId, overlay);
};
