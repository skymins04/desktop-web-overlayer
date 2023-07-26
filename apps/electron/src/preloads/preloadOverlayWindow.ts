import { listenIPCEvent } from "./preloadIPCListener";

window.addEventListener("keydown", (e) => {
  if (e.which === 81 && e.shiftKey && e.ctrlKey)
    document.getElementsByTagName("html")[0].classList.add("show-border");
});

window.addEventListener("keyup", () => {
  document.getElementsByTagName("html")[0].classList.remove("show-border");
});

listenIPCEvent.InitWebOverlay();
listenIPCEvent.ShowBorderWebOverlay();
listenIPCEvent.IgnoreMouseEventWebOverlay();
listenIPCEvent.EnableMoveWebOverlay();
listenIPCEvent.SetIframeUrlWebOverlay();
listenIPCEvent.ShowPositionSizeSaveButton();
