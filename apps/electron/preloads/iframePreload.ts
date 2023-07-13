import { ipcRenderer } from "electron";

declare global {
  interface Window {
    updateWindowPosAndSize: () => void;
    closeIframeWindow: () => void;
    urlId: string;
    title: string;
    url: string;
  }
}

ipcRenderer.on("init", (e, urlId: string, url: string, title: string) => {
  window.updateWindowPosAndSize = () => {
    ipcRenderer.send("update-iframe-pos-size", urlId);
  };
  window.closeIframeWindow = () => {
    ipcRenderer.send("close", urlId);
    window.close();
  };
  window.urlId = urlId;
  window.url = url;
  window.title = title;
});

ipcRenderer.on("show-border", (e, isShow: boolean) => {
  if (isShow)
    document.getElementsByTagName("html")[0].classList.add("show-border");
  else document.getElementsByTagName("html")[0].classList.remove("show-border");
  console.log("hello world");
});

ipcRenderer.on("ignore-window-mouse-event", (e, isIgnore: boolean) => {
  if (isIgnore)
    document
      .getElementsByTagName("html")[0]
      .classList.add("ignore-mouse-event");
  else
    document
      .getElementsByTagName("html")[0]
      .classList.remove("ignore-mouse-event");
});

ipcRenderer.on("enable-move-window", (e, isEnabled: boolean) => {
  if (isEnabled)
    document.getElementsByTagName("html")[0].classList.add("draggable");
  else document.getElementsByTagName("html")[0].classList.remove("draggable");
});

ipcRenderer.on("set-iframe-url", (e, url: string) => {
  document.getElementById("iframe")?.setAttribute("src", url);
});

window.addEventListener("keydown", (e) => {
  if (e.which === 81 && e.shiftKey && e.ctrlKey)
    document.getElementsByTagName("html")[0].classList.add("show-border");
});

window.addEventListener("keyup", () => {
  document.getElementsByTagName("html")[0].classList.remove("show-border");
});
