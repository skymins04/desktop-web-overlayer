import { ipcRenderer } from "electron";

export type Page = { title: string; url: string; customTheme: string };
export type Pages = {
  [key: string]: Page;
};
declare global {
  interface Window {
    addWebPage: (page: Page) => void;
  }
}

window.addWebPage = (page) => {
  ipcRenderer.send("add-web-page", page);
};
