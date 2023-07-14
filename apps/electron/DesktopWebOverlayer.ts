import { BrowserWindow, Menu, Tray, app, nativeImage, ipcMain } from "electron";
import electronWindowState, { State } from "electron-window-state";
import {
  WindowBoolean,
  WindowPositions,
  WindowSizes,
  getStorageValue,
  setStorageValue,
} from "./utils";
import {
  DesktopWebOverlayerAddPagePreloadJsPath,
  DesktopWebOverlayerAddWebPageHTMLPath,
  DesktopWebOverlayerIframePreloadJsPath,
  DesktopWebOverlayerIndexHTMLPath,
  logoImagePath,
  title,
  titleVersion,
} from "./constants";
import { Page, Pages } from "./preloads/addPagePreload";
import { uuid } from "uuidv4";

export class DesktopWebOverlayer {
  constructor() {
    app.on("ready", () => {
      this.init();
    });
    app.on("window-all-closed", () => {});
  }

  /*************************************************************
   * System Objects
   *************************************************************/

  private addWebPageWindow: BrowserWindow | null = null;
  private windows: { [key: string]: BrowserWindow } = {};
  private windowStates: { [key: string]: State } = {};
  private tray: Tray | null = null;

  /*************************************************************
   * Storage Values
   *************************************************************/

  private urls: Pages = {};
  private urlIds: string[] = [];
  private activeUrlIds: string[] = [];
  private windowSizes: WindowSizes = {};
  private windowPositions: WindowPositions = {};
  private isIgnoreMouseEvent: WindowBoolean = {};
  private isEnableMoveWindow: WindowBoolean = {};
  private isShowBorder: WindowBoolean = {};

  /*************************************************************
   * Initializers
   *************************************************************/

  private init() {
    this.initValues();
    this.initIpcListeners();
    this.initWindows();
    this.initTray();
  }

  private initValues() {
    const urls = getStorageValue("urls");
    this.updatePageValues(typeof urls === "object" ? urls : {});
    const positions = getStorageValue("position");
    this.windowPositions = typeof positions === "object" ? positions : {};
    const sizes = getStorageValue("size");
    this.windowSizes = typeof sizes === "object" ? sizes : {};
    const ignoreMouseEvent = getStorageValue("ignoreMouseEvent");
    this.isIgnoreMouseEvent =
      typeof ignoreMouseEvent === "object" ? ignoreMouseEvent : {};
    const enableMoveWindow = getStorageValue("enableMoveWindow");
    this.isEnableMoveWindow =
      typeof enableMoveWindow === "object" ? enableMoveWindow : {};
    const showBorder = getStorageValue("showBorder");
    this.isShowBorder = typeof showBorder === "object" ? showBorder : {};
  }

  private initIpcListeners() {
    ipcMain.on("add-web-page", (e, page: Page) => {
      const pages = getStorageValue("urls") || {};
      const newPages = { ...pages };
      newPages[uuid()] = page;

      setStorageValue("urls", newPages);
      this.updatePageValues(newPages);
      this.updateTrayContextMenu();
    });
    ipcMain.on("get-web-page-list", (e) => {
      e.sender.send("get-web-page-list", this.urls);
    });
    ipcMain.on("update-iframe-pos-size", (e, urlId: string) => {
      this.updateWindowState(urlId);
    });
    ipcMain.on("close", (e, urlId: string) => {
      this.removeActiveUrlId(urlId);
      this.updateTrayContextMenu();
    });
  }

  private initWindows() {
    if (this.activeUrlIds.length === 0 && this.urlIds.length === 0) {
      this.openAddWebWindow();
    } else {
      this.openActiveURLIframeWindows();
    }
  }

  private initTray() {
    const trayIconImage = nativeImage.createFromPath(logoImagePath);
    this.tray = new Tray(trayIconImage.resize({ width: 16, height: 16 }));
    this.tray.setToolTip(titleVersion);
    this.updateTrayContextMenu();
  }

  /*************************************************************
   * Updaters
   *************************************************************/

  private updatePageValues(page: Pages) {
    this.urls = page;
    this.urlIds = Object.keys(this.urls);
    this.activeUrlIds = (
      Array.isArray(getStorageValue("activeUrls"))
        ? getStorageValue("activeUrls")
        : []
    ).filter((activeUrl) => this.urlIds.includes(activeUrl));
  }

  private updateWindowState = (urlId: string) => {
    const urlWindow = this.windows[urlId];
    const windowState = this.windowStates[urlId];
    this.updateWindowPosition(urlId, windowState);
    this.updateWindowSize(urlId, urlWindow);
  };

  private updateWindowPosition(urlId: string, windowState: State) {
    const windowPosition = {
      x: windowState.x,
      y: windowState.y,
    };
    this.windowPositions[urlId] = windowPosition;
    setStorageValue("position", this.windowPositions);
  }

  private updateWindowSize(urlId: string, urlWindow: BrowserWindow) {
    const size = urlWindow.getSize();
    const windowSize = { width: size[0], height: size[1] };
    this.windowSizes[urlId] = windowSize;
    setStorageValue("size", this.windowSizes);
  }

  private updateTrayContextMenu() {
    const trayMenus = Menu.buildFromTemplate([
      { label: titleVersion, type: "normal" },
      { type: "separator" },
      {
        label: "마우스 클릭 통과",
        type: "submenu",
        submenu: Object.entries(this.isIgnoreMouseEvent)
          .filter(([urlId, _]) => this.activeUrlIds.includes(urlId))
          .map(([urlId, value]) => ({
            label: this.urls[urlId].title,
            type: "checkbox",
            checked: value,
            click: () => {
              this.setIgnoreWindowMouseEvent(urlId, !value);
              this.updateTrayContextMenu();
            },
          })),
      },
      {
        label: "프레임 상단 핸들 보기",
        type: "submenu",
        submenu: Object.entries(this.isEnableMoveWindow)
          .filter(([urlId, _]) => this.activeUrlIds.includes(urlId))
          .map(([urlId, value]) => ({
            label: this.urls[urlId].title,
            type: "checkbox",
            checked: value,
            click: () => {
              this.setEnableMoveWindowEvent(urlId, !value);
              this.updateTrayContextMenu();
            },
          })),
      },
      {
        label: "오버레이 외곽선 보기",
        type: "submenu",
        submenu: Object.entries(this.isShowBorder)
          .filter(([urlId, _]) => this.activeUrlIds.includes(urlId))
          .map(([urlId, value]) => ({
            label: this.urls[urlId].title,
            type: "checkbox",
            checked: value,
            click: () => {
              this.setShowWindowBorder(urlId, !value);
              this.updateTrayContextMenu();
            },
          })),
      },
      {
        label: "오버레이 새로고침",
        type: "submenu",
        submenu: this.activeUrlIds.map((urlId) => ({
          label: this.urls[urlId].title,
          type: "normal",
          click: () => this.windows[urlId].reload(),
        })),
      },
      { type: "separator" },
      {
        label: "웹페이지 열기/닫기",
        type: "submenu",
        submenu: Object.entries(this.urls).map(([key, url]) => {
          const isActive = this.activeUrlIds.includes(key);
          return {
            label: url.title,
            type: "checkbox",
            checked: isActive,
            click: () => {
              if (isActive) {
                this.closeIframeWindow(key);
              } else {
                this.openIframeWindow(key);
              }
            },
          };
        }),
      },
      {
        label: "새 웹페이지 추가하기...",
        type: "normal",
        enabled: this.addWebPageWindow === null,
        click: () => this.openAddWebWindow(),
      },
      { type: "separator" },
      {
        label: "설정 열기...",
        type: "normal",
        click: () => {
          console.log("hello");
        },
      },
      {
        label: "개발자도구 열기",
        type: "submenu",
        submenu: this.activeUrlIds.map((urlId) => ({
          label: this.urls[urlId].title,
          type: "normal",
          click: () =>
            this.windows[urlId].webContents.openDevTools({ mode: "undocked" }),
        })),
      },
      { type: "separator" },
      {
        label: "종료",
        type: "normal",
        click: app.quit,
      },
    ]);
    this.tray?.setContextMenu(trayMenus);
  }

  /*************************************************************
   * Window Opener/Closer
   *************************************************************/

  private openAddWebWindow() {
    this.addWebPageWindow = new BrowserWindow({
      center: true,
      alwaysOnTop: true,
      webPreferences: {
        webSecurity: true,
        nodeIntegration: true,
        contextIsolation: false,
        devTools: true,
        preload: DesktopWebOverlayerAddPagePreloadJsPath,
      },
    });
    this.ignoreXFrameOptionsHeader(this.addWebPageWindow);

    this.addWebPageWindow.loadURL(DesktopWebOverlayerAddWebPageHTMLPath);

    this.addWebPageWindow.setTitle("새 웹페이지 추가");
    this.addWebPageWindow.on("ready-to-show", () => {
      this.updateTrayContextMenu();
    });
    this.addWebPageWindow.on("closed", () => {
      this.addWebPageWindow = null;
      this.updateTrayContextMenu();
    });
  }

  // TODO: front 내 창 종료 버튼 외에는 창을 종료할 수 없도록 해야함.
  private openIframeWindow(urlId: string) {
    if (this.urlIds.includes(urlId)) {
      const windowState = electronWindowState({
        defaultWidth: 500,
        defaultHeight: 500,
      });
      const iframeWindow = new BrowserWindow({
        width: this.windowSizes[urlId]?.width || windowState.width,
        height: this.windowSizes[urlId]?.height || windowState.height,
        x: this.windowPositions[urlId]?.x || windowState.x,
        y: this.windowPositions[urlId]?.y || windowState.y,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        title: title,
        webPreferences: {
          webSecurity: true,
          nodeIntegration: true,
          contextIsolation: false,
          preload: DesktopWebOverlayerIframePreloadJsPath,
        },
      });
      this.ignoreXFrameOptionsHeader(iframeWindow);
      this.setWindowLangaugeToKR(iframeWindow);

      if (this.isIgnoreMouseEvent[urlId] === undefined)
        this.isIgnoreMouseEvent[urlId] = false;
      if (this.isEnableMoveWindow[urlId] === undefined)
        this.isEnableMoveWindow[urlId] = true;
      if (this.isShowBorder[urlId] === undefined)
        this.isShowBorder[urlId] = true;

      iframeWindow.loadURL(DesktopWebOverlayerIndexHTMLPath);

      iframeWindow.on("ready-to-show", () => {
        this.injectCSSStyleToIframe(
          iframeWindow,
          this.urls[urlId].customTheme || ""
        );

        this.setIgnoreWindowMouseEvent(urlId, this.isIgnoreMouseEvent[urlId]);
        this.setEnableMoveWindowEvent(urlId, this.isEnableMoveWindow[urlId]);
        this.setShowWindowBorder(urlId, this.isShowBorder[urlId]);
        this.setIfraneWindowUrlInfo(
          urlId,
          this.urls[urlId]?.url,
          this.urls[urlId]?.title
        );
        this.setIframeSrc(urlId, this.urls[urlId]?.url || "#");
        this.addActiveUrlId(urlId);
        this.updateTrayContextMenu();
      });
      windowState.manage(iframeWindow);

      this.windows[urlId] = iframeWindow;
      this.windowStates[urlId] = windowState;
    }
  }

  private openActiveURLIframeWindows() {
    for (const urlId of this.activeUrlIds) {
      this.openIframeWindow(urlId);
    }
  }

  private closeIframeWindow(urlId: string) {
    const iframeWindow = this.windows[urlId];
    iframeWindow && iframeWindow.close();
    this.removeActiveUrlId(urlId);
    this.updateTrayContextMenu();
  }

  /*************************************************************
   *  Window Preproccesors
   *************************************************************/

  private ignoreXFrameOptionsHeader(iframeWindow: BrowserWindow) {
    iframeWindow.webContents.session.webRequest.onHeadersReceived(
      { urls: ["*://*/*"] },
      (d, c) => {
        if (!d.responseHeaders) return;
        if (d.responseHeaders["X-Frame-Options"]) {
          delete d.responseHeaders["X-Frame-Options"];
        } else if (d.responseHeaders["x-frame-options"]) {
          delete d.responseHeaders["x-frame-options"];
        }

        c({ cancel: false, responseHeaders: d.responseHeaders });
      }
    );
  }

  private setWindowLangaugeToKR(iframeWindow: BrowserWindow) {
    iframeWindow.webContents.debugger.attach();
    iframeWindow.webContents.debugger.sendCommand(
      "Emulation.setUserAgentOverride",
      {
        userAgent: iframeWindow.webContents.userAgent,
        acceptLanguage: "ko_KR",
      }
    );
  }

  private injectCSSStyleToIframe(
    iframeWindow: BrowserWindow,
    styleString: string
  ) {
    setTimeout(() => {
      const [iframe] = iframeWindow.webContents.mainFrame.frames;
      const encodedStyleString = this.replaceQuoteEcapeString(styleString);

      if (iframe) {
        iframe.on("dom-ready", () => {
          setTimeout(() => {
            iframe.executeJavaScript(`
              const body = document.querySelector('body');
              const style = document.createElement('style');
              style.innerHTML = \`${encodedStyleString}\`;
              body.appendChild(style);
            `);
          }, 10);
        });
      }
    }, 10);
  }

  private setIfraneWindowUrlInfo(urlId: string, url: string, title: string) {
    this.windows[urlId].webContents.send("init", urlId, url, title);
  }

  private setIframeSrc(urlId: string, url: string) {
    this.windows[urlId].webContents.send("set-iframe-url", url);
  }

  /*************************************************************
   * Storage Value Setters
   *************************************************************/

  private addActiveUrlId(urlId: string) {
    if (!this.activeUrlIds.includes(urlId)) {
      this.activeUrlIds.push(urlId);
      setStorageValue("activeUrls", this.activeUrlIds);
    }
  }

  private removeActiveUrlId(urlId: string) {
    this.activeUrlIds = this.activeUrlIds.filter((id) => id !== urlId);
    setStorageValue("activeUrls", this.activeUrlIds);
  }

  private setIgnoreWindowMouseEvent(urlId: string, state: boolean) {
    this.windows[urlId].setIgnoreMouseEvents(state);
    this.windows[urlId].webContents.send("ignore-window-mouse-event", state);
    this.isIgnoreMouseEvent[urlId] = state;
    setStorageValue("ignoreMouseEvent", this.isIgnoreMouseEvent);
  }

  private setEnableMoveWindowEvent(urlId: string, state: boolean) {
    this.windows[urlId].webContents.send("enable-move-window", state);
    this.isEnableMoveWindow[urlId] = state;
    setStorageValue("enableMoveWindow", this.isEnableMoveWindow);
  }

  private setShowWindowBorder(urlId: string, state: boolean) {
    this.windows[urlId].webContents.send("show-border", state);
    this.isShowBorder[urlId] = state;
    setStorageValue("showBorder", this.isShowBorder);
  }

  /*************************************************************
   * Utilities
   *************************************************************/

  private replaceQuoteEcapeString(str: string) {
    return str.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/`/g, "\\`");
  }
}
