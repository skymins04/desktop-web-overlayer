import { IpcEventKeys } from "@constants";
import { ExportedOverlays, Overlay } from "@modules";
import { ipcRenderer } from "electron";

export const sendIPCEvent: Record<
  keyof Pick<
    typeof IpcEventKeys,
    | "AddWebOverlay"
    | "GetWebOverlayList"
    | "OpenWebOverlay"
    | "CloseWebOverlay"
    | "ReloadWebOverlay"
    | "DeleteWebOverlay"
    | "EditWebOverlay"
    | "IgnoreMouseEventWebOverlay"
    | "EnableMoveWebOverlay"
    | "ShowBorderWebOverlay"
    | "ExportOverlay"
    | "ImportOverlay"
    | "DeleteSettingHistory"
  >,
  any
> = {
  AddWebOverlay(overlay: Overlay) {
    const trimedOverlay: Overlay = {
      ...overlay,
      title: overlay.title.trim(),
      url: overlay.url.trim(),
    };
    ipcRenderer.send(IpcEventKeys.AddWebOverlay, trimedOverlay);
  },
  GetWebOverlayList() {
    ipcRenderer.send(IpcEventKeys.GetWebOverlayList);
  },
  OpenWebOverlay(overlayId: string) {
    ipcRenderer.send(IpcEventKeys.OpenWebOverlay, overlayId);
  },
  CloseWebOverlay(overlayId: string) {
    ipcRenderer.send(IpcEventKeys.CloseWebOverlay, overlayId);
  },
  ReloadWebOverlay(overlayId: string) {
    ipcRenderer.send(IpcEventKeys.ReloadWebOverlay, overlayId);
  },
  DeleteWebOverlay(overlayId: string) {
    ipcRenderer.send(IpcEventKeys.DeleteWebOverlay, overlayId);
  },
  EditWebOverlay(overlayId: string, overlay: Overlay) {
    ipcRenderer.send(IpcEventKeys.EditWebOverlay, overlayId, overlay);
  },
  IgnoreMouseEventWebOverlay(overlayId: string) {
    ipcRenderer.send(IpcEventKeys.IgnoreMouseEventWebOverlay, overlayId);
  },
  EnableMoveWebOverlay(overlayId: string) {
    ipcRenderer.send(IpcEventKeys.EnableMoveWebOverlay, overlayId);
  },
  ShowBorderWebOverlay(overlayId: string) {
    ipcRenderer.send(IpcEventKeys.ShowBorderWebOverlay, overlayId);
  },
  ExportOverlay(cb: (result: "success" | "fail" | "cancel") => void) {
    ipcRenderer.once(
      IpcEventKeys.ExportOverlay,
      (e, result: "success" | "fail" | "cancel") => {
        cb(result);
      }
    );
    ipcRenderer.send(IpcEventKeys.ExportOverlay);
  },
  ImportOverlay(
    cb: (result: "success" | "fail" | "cancel") => void,
    filePath?: string
  ) {
    ipcRenderer.once(
      IpcEventKeys.ImportOverlay,
      (e, result: "success" | "fail" | "cancel") => {
        cb(result);
      }
    );
    ipcRenderer.send(IpcEventKeys.ImportOverlay, filePath);
  },
  DeleteSettingHistory(index: number) {
    ipcRenderer.send(IpcEventKeys.DeleteSettingHistory, index);
  },
};
