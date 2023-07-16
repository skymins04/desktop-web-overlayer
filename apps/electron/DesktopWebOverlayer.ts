import { BrowserWindow, Menu, Tray, app, nativeImage, ipcMain } from "electron";
import electronWindowState, { State } from "electron-window-state";
import {
  WindowBooleans,
  WindowPositions,
  WindowSizes,
  getStorageValue,
  setStorageValue,
  Overlay,
  Overlays,
} from "./utils";
import {
  DesktopWebOverlayerSettingsPreloadJsPath,
  DesktopWebOverlayerOverlayPreloadJsPath,
  DesktopWebOverlayerIndexHTMLPath,
  logoImagePath,
  title,
  titleVersion,
  DesktopWebOverlayerSettingsAddOverlayHTMLPath,
  DesktopWebOverlayerSettingsHTMLPath,
} from "./constants";
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

  private settingsWindow: BrowserWindow | null = null;
  private overlayWindows: Record<string, BrowserWindow> = {};
  private overlayWindowStates: Record<string, State> = {};
  private tray: Tray | null = null;

  /*************************************************************
   * Storage Values
   *************************************************************/

  private overlays: Overlays = {};
  private activeOverlayIds: string[] = [];
  private overlayWindowSizes: WindowSizes = {};
  private overlayWindowPositions: WindowPositions = {};
  private isIgnoreOverlayWindowMouseEvents: WindowBooleans = {};
  private isEnableOverlayWindowMoves: WindowBooleans = {};
  private isShowOverlayWindowBorders: WindowBooleans = {};

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
    const overlays = getStorageValue("overlays");
    this.updateOverlays(typeof overlays === "object" ? overlays : {});
    const overlayPositions = getStorageValue("overlayPositions");
    this.overlayWindowPositions =
      typeof overlayPositions === "object" ? overlayPositions : {};
    const overlaySizes = getStorageValue("overlaySizes");
    this.overlayWindowSizes =
      typeof overlaySizes === "object" ? overlaySizes : {};
    const isIgnoreOverlayWindowMouseEvents = getStorageValue(
      "isIgnoreOverlayWindowMouseEvents"
    );
    this.isIgnoreOverlayWindowMouseEvents =
      typeof isIgnoreOverlayWindowMouseEvents === "object"
        ? isIgnoreOverlayWindowMouseEvents
        : {};
    const isEnableOverlayWindowMoves = getStorageValue(
      "isEnableOverlayWindowMoves"
    );
    this.isEnableOverlayWindowMoves =
      typeof isEnableOverlayWindowMoves === "object"
        ? isEnableOverlayWindowMoves
        : {};
    const isShowOverlayWindowBorders = getStorageValue(
      "isShowOverlayWindowBorders"
    );
    this.isShowOverlayWindowBorders =
      typeof isShowOverlayWindowBorders === "object"
        ? isShowOverlayWindowBorders
        : {};
  }

  private initIpcListeners() {
    ipcMain.on("add-web-overlay", (e, overlay: Overlay) => {
      this.addOverlay(overlay);
      setTimeout(() => {
        e.sender.send(
          "get-web-overlay-list",
          this.overlays,
          this.activeOverlayIds
        );
      }, 10);
      this.updateTrayContextMenu();
    });
    ipcMain.on("get-web-overlay-list", (e) => {
      e.sender.send(
        "get-web-overlay-list",
        this.overlays,
        this.activeOverlayIds
      );
    });
    ipcMain.on("update-iframe-pos-size", (e, overlayId: string) => {
      this.updateWindowState(overlayId);
    });
    ipcMain.on("close", (e, overlayId: string) => {
      this.removeActiveOverlayId(overlayId);
      this.updateTrayContextMenu();
    });
    ipcMain.on("delete-overlay", (e, overlayId: string) => {
      this.removeOverlay(overlayId);
      setTimeout(() => {
        e.sender.send(
          "get-web-overlay-list",
          this.overlays,
          this.activeOverlayIds
        );
      }, 10);
      this.updateTrayContextMenu();
    });
    ipcMain.on("edit-overlay", (e, overlayId: string, overlay: Overlay) => {
      this.editOverlay(overlayId, overlay);
      setTimeout(() => {
        e.sender.send(
          "get-web-overlay-list",
          this.overlays,
          this.activeOverlayIds
        );
      }, 10);
      this.updateTrayContextMenu();
    });
    ipcMain.on("open-overlay", (e, overlayId: string) => {
      if (!this.overlayWindows[overlayId]) {
        this.openOverlayWindow(overlayId);
        setTimeout(() => {
          e.sender.send(
            "get-web-overlay-list",
            this.overlays,
            this.activeOverlayIds
          );
        }, 200);
        this.updateTrayContextMenu();
      }
    });
    ipcMain.on("close-overlay", (e, overlayId: string) => {
      if (this.overlayWindows[overlayId]) {
        this.closeOverlayWindow(overlayId);
        setTimeout(() => {
          e.sender.send(
            "get-web-overlay-list",
            this.overlays,
            this.activeOverlayIds
          );
        }, 10);
        this.updateTrayContextMenu();
      }
    });
    ipcMain.on("reload-overlay", (e, overlayId: string) => {
      if (this.overlayWindows[overlayId]) {
        this.reloadOverlayWindow(overlayId);
        setTimeout(() => {
          e.sender.send(
            "get-web-overlay-list",
            this.overlays,
            this.activeOverlayIds
          );
        }, 10);
        this.updateTrayContextMenu();
      }
    });
  }

  private initWindows() {
    if (
      this.activeOverlayIds.length === 0 &&
      Object.keys(this.overlays).length === 0
    ) {
      this.openSettingsWindow("addOverlay");
    } else {
      this.openActiveOverlayWindows();
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

  private updateOverlays(overlays: Overlays) {
    this.overlays = overlays;
    const activeOverlayIds = getStorageValue("activeOverlayIds");
    this.activeOverlayIds = (
      Array.isArray(activeOverlayIds) ? activeOverlayIds : []
    ).filter((activeOverlayId) => !!this.overlays[activeOverlayId]);
  }

  private updateWindowState = (overlayId: string) => {
    const overlayWindow = this.overlayWindows[overlayId];
    const overlayWindowState = this.overlayWindowStates[overlayId];
    this.updateWindowPosition(overlayId, overlayWindowState);
    this.updateWindowSize(overlayId, overlayWindow);
  };

  private updateWindowPosition(overlayId: string, overlayWindowState: State) {
    const overlayWindowPosition = {
      x: overlayWindowState.x,
      y: overlayWindowState.y,
    };
    this.overlayWindowPositions[overlayId] = overlayWindowPosition;
    setStorageValue("overlayPositions", this.overlayWindowPositions);
  }

  private updateWindowSize(overlayId: string, overlayWindow: BrowserWindow) {
    const size = overlayWindow.getSize();
    const overlayWindowSize = { width: size[0], height: size[1] };
    this.overlayWindowSizes[overlayId] = overlayWindowSize;
    setStorageValue("overlaySizes", this.overlayWindowSizes);
  }

  private updateTrayContextMenu() {
    const trayMenus = Menu.buildFromTemplate([
      { label: titleVersion, type: "normal" },
      { type: "separator" },
      {
        label: "마우스 클릭 통과",
        type: "submenu",
        submenu: Object.entries(this.isIgnoreOverlayWindowMouseEvents)
          .filter(([overlayId, _]) => this.activeOverlayIds.includes(overlayId))
          .map(([overlayId, value]) => ({
            label: this.overlays[overlayId].title,
            type: "checkbox",
            checked: value,
            click: () => {
              this.setIgnoreOverlayWindowMouseEvent(overlayId, !value);
              this.updateTrayContextMenu();
            },
          })),
      },
      {
        label: "프레임 상단 핸들 보기",
        type: "submenu",
        submenu: Object.entries(this.isEnableOverlayWindowMoves)
          .filter(([overlayId, _]) => this.activeOverlayIds.includes(overlayId))
          .map(([overlayId, value]) => ({
            label: this.overlays[overlayId].title,
            type: "checkbox",
            checked: value,
            click: () => {
              this.setEnableMoveOverlayWindowEvent(overlayId, !value);
              this.updateTrayContextMenu();
            },
          })),
      },
      {
        label: "오버레이 외곽선 보기",
        type: "submenu",
        submenu: Object.entries(this.isShowOverlayWindowBorders)
          .filter(([overlayId, _]) => this.activeOverlayIds.includes(overlayId))
          .map(([overlayId, value]) => ({
            label: this.overlays[overlayId].title,
            type: "checkbox",
            checked: value,
            click: () => {
              this.setShowOverlayWindowBorder(overlayId, !value);
              this.updateTrayContextMenu();
            },
          })),
      },
      {
        label: "오버레이 새로고침",
        type: "submenu",
        submenu: this.activeOverlayIds.map((overlayId) => ({
          label: this.overlays[overlayId].title,
          type: "normal",
          click: () => this.reloadOverlayWindow(overlayId),
        })),
      },
      { type: "separator" },
      {
        label: "웹페이지 열기/닫기",
        type: "submenu",
        submenu: Object.entries(this.overlays).map(([key, url]) => {
          const isActive = this.activeOverlayIds.includes(key);
          return {
            label: url.title,
            type: "checkbox",
            checked: isActive,
            click: () => {
              if (isActive) {
                this.closeOverlayWindow(key);
              } else {
                this.openOverlayWindow(key);
              }
            },
          };
        }),
      },
      {
        label: "새 웹페이지 추가하기...",
        type: "normal",
        enabled: this.settingsWindow === null,
        click: () => this.openSettingsWindow("addOverlay"),
      },
      { type: "separator" },
      {
        label: "설정 열기...",
        type: "normal",
        enabled: this.settingsWindow === null,
        click: () => this.openSettingsWindow(),
      },
      {
        label: "개발자도구 열기",
        type: "submenu",
        submenu: this.activeOverlayIds.map((overlayId) => ({
          label: this.overlays[overlayId].title,
          type: "normal",
          click: () =>
            this.overlayWindows[overlayId].webContents.openDevTools({
              mode: "undocked",
            }),
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

  private openSettingsWindow(menu?: string) {
    this.settingsWindow = new BrowserWindow({
      center: true,
      alwaysOnTop: true,
      title: "설정",
      webPreferences: {
        webSecurity: true,
        nodeIntegration: true,
        contextIsolation: false,
        preload: DesktopWebOverlayerSettingsPreloadJsPath,
      },
    });
    this.ignoreXFrameOptionsHeader(this.settingsWindow);

    this.settingsWindow.loadURL(
      menu === "addOverlay"
        ? DesktopWebOverlayerSettingsAddOverlayHTMLPath
        : DesktopWebOverlayerSettingsHTMLPath
    );

    this.settingsWindow.on("ready-to-show", () => {
      this.updateTrayContextMenu();
    });
    this.settingsWindow.on("closed", () => {
      this.settingsWindow = null;
      this.updateTrayContextMenu();
    });
  }

  // TODO: front 내 창 종료 버튼 외에는 창을 종료할 수 없도록 해야함.
  private openOverlayWindow(overlayId: string) {
    const overlay = this.overlays[overlayId];
    if (overlay) {
      const windowState = electronWindowState({
        defaultWidth: 500,
        defaultHeight: 500,
      });
      const overlayWindow = new BrowserWindow({
        width: this.overlayWindowSizes[overlayId]?.width || windowState.width,
        height:
          this.overlayWindowSizes[overlayId]?.height || windowState.height,
        x: this.overlayWindowPositions[overlayId]?.x || windowState.x,
        y: this.overlayWindowPositions[overlayId]?.y || windowState.y,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        title: title,
        opacity: overlay.opacity / 100,
        webPreferences: {
          webSecurity: true,
          nodeIntegration: true,
          contextIsolation: false,
          preload: DesktopWebOverlayerOverlayPreloadJsPath,
        },
      });
      this.ignoreXFrameOptionsHeader(overlayWindow);
      this.setWindowLangaugeToKR(overlayWindow);

      if (this.isIgnoreOverlayWindowMouseEvents[overlayId] === undefined)
        this.isIgnoreOverlayWindowMouseEvents[overlayId] = false;
      if (this.isEnableOverlayWindowMoves[overlayId] === undefined)
        this.isEnableOverlayWindowMoves[overlayId] = true;
      if (this.isShowOverlayWindowBorders[overlayId] === undefined)
        this.isShowOverlayWindowBorders[overlayId] = true;

      overlayWindow.loadURL(DesktopWebOverlayerIndexHTMLPath);

      overlayWindow.on("ready-to-show", () => {
        const customTheme = overlay.isEnableFontSize
          ? `
            ${overlay.customTheme || ""}
            * {
              font-size: ${overlay.fontSize}px !important;
            }
          `
          : overlay.customTheme || "";
        this.injectCSSStyleToIframe(overlayWindow, customTheme);

        this.setIgnoreOverlayWindowMouseEvent(
          overlayId,
          this.isIgnoreOverlayWindowMouseEvents[overlayId]
        );
        this.setEnableMoveOverlayWindowEvent(
          overlayId,
          this.isEnableOverlayWindowMoves[overlayId]
        );
        this.setShowOverlayWindowBorder(
          overlayId,
          this.isShowOverlayWindowBorders[overlayId]
        );
        this.initOverlayWindow(overlayId, overlay.url, overlay.title);
        this.setOverlayWindowIframeSrc(overlayId, overlay.url);
        this.addActiveOverlayId(overlayId);
        this.updateTrayContextMenu();
      });
      windowState.manage(overlayWindow);

      this.overlayWindows[overlayId] = overlayWindow;
      this.overlayWindowStates[overlayId] = windowState;
    }
  }

  private openActiveOverlayWindows() {
    for (const overlayId of this.activeOverlayIds) {
      this.openOverlayWindow(overlayId);
    }
  }

  private closeOverlayWindow(overlayId: string) {
    const overlayWindow = this.overlayWindows[overlayId];
    overlayWindow && overlayWindow.close();
    delete this.overlayWindows[overlayId];
    this.removeActiveOverlayId(overlayId);
    this.updateTrayContextMenu();
  }

  private reloadOverlayWindow(overlayId: string) {
    const overlayWindow = this.overlayWindows[overlayId];
    if (overlayWindow) {
      this.overlayWindows[overlayId].close();
      this.openOverlayWindow(overlayId);
    }
  }

  /*************************************************************
   *  Window Preproccesors
   *************************************************************/

  private ignoreXFrameOptionsHeader(overlayWindow: BrowserWindow) {
    overlayWindow.webContents.session.webRequest.onHeadersReceived(
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

  private setWindowLangaugeToKR(overlayWindow: BrowserWindow) {
    overlayWindow.webContents.debugger.attach();
    overlayWindow.webContents.debugger.sendCommand(
      "Emulation.setUserAgentOverride",
      {
        userAgent: overlayWindow.webContents.userAgent,
        acceptLanguage: "ko_KR",
      }
    );
  }

  private injectCSSStyleToIframe(
    overlayWindow: BrowserWindow,
    styleString: string
  ) {
    setTimeout(() => {
      const [iframe] = overlayWindow.webContents.mainFrame.frames;
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

  private initOverlayWindow(overlayId: string, url: string, title: string) {
    this.overlayWindows[overlayId].webContents.send(
      "init",
      overlayId,
      url,
      title
    );
  }

  private setOverlayWindowIframeSrc(overlayId: string, url: string) {
    this.overlayWindows[overlayId].webContents.send("set-iframe-url", url);
  }

  /*************************************************************
   * Storage Value Setters
   *************************************************************/

  private addOverlay = (overlay: Overlay) => {
    const newOverlays = { ...this.overlays };
    newOverlays[uuid()] = overlay;

    setStorageValue("overlays", newOverlays);
    this.updateOverlays(newOverlays);
  };

  private removeOverlay = (overlayId: string) => {
    if (this.overlays[overlayId]) {
      const newOverlays = { ...this.overlays };
      delete newOverlays[overlayId];

      setStorageValue("overlays", newOverlays);
      this.updateOverlays(newOverlays);

      const overlayWindow = this.overlayWindows[overlayId];
      if (overlayWindow) {
        overlayWindow.close();
      }
    }
  };

  private editOverlay = (overlayId: string, overlay: Overlay) => {
    if (this.overlays[overlayId]) {
      const newOverlays = { ...this.overlays };
      newOverlays[overlayId] = overlay;

      setStorageValue("overlays", newOverlays);
      this.updateOverlays(newOverlays);
      this.reloadOverlayWindow(overlayId);
    }
  };

  private addActiveOverlayId(overlayId: string) {
    if (!this.activeOverlayIds.includes(overlayId)) {
      this.activeOverlayIds.push(overlayId);
      setStorageValue("activeOverlayIds", this.activeOverlayIds);
    }
  }

  private removeActiveOverlayId(overlayId: string) {
    this.activeOverlayIds = this.activeOverlayIds.filter(
      (id) => id !== overlayId
    );
    setStorageValue("activeOverlayIds", this.activeOverlayIds);
  }

  private setIgnoreOverlayWindowMouseEvent(overlayId: string, state: boolean) {
    this.overlayWindows[overlayId].setIgnoreMouseEvents(state);
    this.overlayWindows[overlayId].webContents.send(
      "ignore-window-mouse-event",
      state
    );
    this.isIgnoreOverlayWindowMouseEvents[overlayId] = state;
    setStorageValue(
      "isIgnoreOverlayWindowMouseEvents",
      this.isIgnoreOverlayWindowMouseEvents
    );
  }

  private setEnableMoveOverlayWindowEvent(overlayId: string, state: boolean) {
    this.overlayWindows[overlayId].webContents.send(
      "enable-move-window",
      state
    );
    this.isEnableOverlayWindowMoves[overlayId] = state;
    setStorageValue(
      "isEnableOverlayWindowMoves",
      this.isEnableOverlayWindowMoves
    );
  }

  private setShowOverlayWindowBorder(overlayId: string, state: boolean) {
    this.overlayWindows[overlayId].webContents.send("show-border", state);
    this.isShowOverlayWindowBorders[overlayId] = state;
    setStorageValue(
      "isShowOverlayWindowBorders",
      this.isShowOverlayWindowBorders
    );
  }

  /*************************************************************
   * Utilities
   *************************************************************/

  private replaceQuoteEcapeString(str: string) {
    return str.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/`/g, "\\`");
  }
}
