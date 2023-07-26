import { sendIPCEvent } from "./preloadIPCSender";
import { listenIPCEvent } from "./preloadIPCListener";

window.getOverlayListListeners = {};
window.addGetOverlayListListener = (cb) => {
  window.getOverlayListListeners[cb.name] = cb;
};
window.removeGetOverlayListListener = (cb) => {
  if (window.getOverlayListListeners[cb.name]) {
    delete window.getOverlayListListeners[cb.name];
  }
};

window.addWebOverlay = sendIPCEvent.AddWebOverlay;
window.getOverlayList = sendIPCEvent.GetWebOverlayList;
window.openOverlayById = sendIPCEvent.OpenWebOverlay;
window.closeOverlayById = sendIPCEvent.CloseWebOverlay;
window.reloadOverlayById = sendIPCEvent.ReloadWebOverlay;
window.deleteOverlayById = sendIPCEvent.DeleteWebOverlay;
window.editOverlay = sendIPCEvent.EditWebOverlay;
window.toggleIgnoreOverlayWindowMouseEventById =
  sendIPCEvent.IgnoreMouseEventWebOverlay;
window.toggleEnableOverlayWindowMoveById = sendIPCEvent.EnableMoveWebOverlay;
window.toggleShowOverlayWindowBorderById = sendIPCEvent.ShowBorderWebOverlay;
window.exportOverlays = sendIPCEvent.ExportOverlay;
window.importOverlays = sendIPCEvent.ImportOverlay;
window.deleteSettingHistory = sendIPCEvent.DeleteSettingHistory;

listenIPCEvent.GetWebOverlayList();
