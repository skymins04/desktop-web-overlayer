import { ipcRenderer } from "electron";
import { Overlays, WindowBooleans } from "@modules";
import { IpcEventKeys } from "@constants";

export const listenIPCEvent: Record<
  keyof Pick<
    typeof IpcEventKeys,
    | "InitWebOverlay"
    | "ShowBorderWebOverlay"
    | "IgnoreMouseEventWebOverlay"
    | "EnableMoveWebOverlay"
    | "SetIframeUrlWebOverlay"
    | "ShowPositionSizeSaveButton"
    | "GetWebOverlayList"
  >,
  any
> = {
  InitWebOverlay() {
    ipcRenderer.on(
      IpcEventKeys.InitWebOverlay,
      (e, urlId: string, url: string, title: string) => {
        window.updateWindowPosAndSize = () => {
          ipcRenderer.send(IpcEventKeys.UpdateIframePositionSize, urlId);
        };
        window.urlId = urlId;
        window.url = url;
        window.title = title;
      }
    );
  },
  ShowBorderWebOverlay() {
    ipcRenderer.on(IpcEventKeys.ShowBorderWebOverlay, (e, isShow: boolean) => {
      if (isShow)
        document.getElementsByTagName("html")[0].classList.add("show-border");
      else
        document
          .getElementsByTagName("html")[0]
          .classList.remove("show-border");
    });
  },
  IgnoreMouseEventWebOverlay() {
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
  },
  EnableMoveWebOverlay() {
    ipcRenderer.on(
      IpcEventKeys.EnableMoveWebOverlay,
      (e, isEnabled: boolean) => {
        if (isEnabled)
          document.getElementsByTagName("html")[0].classList.add("draggable");
        else
          document
            .getElementsByTagName("html")[0]
            .classList.remove("draggable");
      }
    );
  },
  SetIframeUrlWebOverlay() {
    ipcRenderer.on(IpcEventKeys.SetIframeUrlWebOverlay, (e, url: string) => {
      document.getElementById("iframe")?.setAttribute("src", url);
    });
  },
  ShowPositionSizeSaveButton() {
    ipcRenderer.on(IpcEventKeys.ShowPositionSizeSaveButton, () => {
      document.getElementsByTagName("html")[0].classList.add("need-save");
    });
  },
  GetWebOverlayList() {
    ipcRenderer.on(
      IpcEventKeys.GetWebOverlayList,
      (
        e,
        overlays: Overlays,
        activeOverlayIds: string[],
        isIgnoreOverlayWindowMouseEvents: WindowBooleans,
        isEnableOverlayWindowMoves: WindowBooleans,
        isShowOverlayWindowBorders: WindowBooleans,
        settingFileHistory: string[]
      ) => {
        for (const [, listener] of Object.entries(
          window.getOverlayListListeners
        )) {
          listener(
            overlays,
            activeOverlayIds,
            isIgnoreOverlayWindowMouseEvents,
            isEnableOverlayWindowMoves,
            isShowOverlayWindowBorders,
            settingFileHistory
          );
        }
      }
    );
  },
};
