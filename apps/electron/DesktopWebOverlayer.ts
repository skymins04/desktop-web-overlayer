import {
  BrowserWindow,
  Menu,
  Tray,
  app,
  nativeImage,
  ipcMain,
  WebContents,
} from "electron";
import electronWindowState, { State } from "electron-window-state";
import {
  WindowBooleans,
  WindowPositions,
  WindowSizes,
  getStorageValue,
  setStorageValue,
  Overlay,
  Overlays,
  ExportedOverlay,
  ExportedOverlays,
} from "./utils";
import {
  DesktopWebOverlayerIndexHTMLPath,
  logoImagePath,
  title,
  titleVersion,
  DesktopWebOverlayerSettingsAddOverlayHTMLPath,
  DesktopWebOverlayerSettingsHTMLPath,
  DesktopWebOverlayerPreloadJsPath,
  IpcEventKeys,
  DesktopWebOverlayerCheckUpdateHTMLPath,
} from "./constants";
import { uuid } from "uuidv4";
import { autoUpdater } from "electron-updater";
import { ExportedOverlaysValidationSchema } from "./utils/validators";

export class DesktopWebOverlayer {
  constructor() {
    app.on("ready", () => {
      autoUpdater.on("update-downloaded", () => {
        setTimeout(() => {
          autoUpdater.quitAndInstall();
          app.exit();
        }, 1000);
      });
      this.openCheckUpdateWindow();
      autoUpdater.checkForUpdates().then(() => {
        this.closeCheckUpdateWindow();
        this.init();
      });
    });
    app.on("window-all-closed", () => {});
  }

  /*************************************************************
   * System Objects
   *************************************************************/

  private checkUpdateWindow: BrowserWindow | null = null;
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
    ipcMain.on(IpcEventKeys.AddWebOverlay, (e, overlay: Overlay) => {
      this.addOverlay(overlay);
      this.sendOverlayInfoToOverlayWindow(e.sender);
      this.updateTrayContextMenu();
    });
    ipcMain.on(IpcEventKeys.GetWebOverlayList, (e) => {
      this.sendOverlayInfoToOverlayWindow(e.sender);
    });
    ipcMain.on(
      IpcEventKeys.UpdateIframePositionSize,
      (e, overlayId: string) => {
        this.updateWindowState(overlayId);
      }
    );
    ipcMain.on(IpcEventKeys.DeleteWebOverlay, (e, overlayId: string) => {
      this.removeOverlay(overlayId);
      this.sendOverlayInfoToOverlayWindow(e.sender);
      this.updateTrayContextMenu();
    });
    ipcMain.on(
      IpcEventKeys.EditWebOverlay,
      (e, overlayId: string, overlay: Overlay) => {
        this.editOverlay(overlayId, overlay);
        this.sendOverlayInfoToOverlayWindow(e.sender);
        this.updateTrayContextMenu();
      }
    );
    ipcMain.on(IpcEventKeys.OpenWebOverlay, (e, overlayId: string) => {
      if (!this.overlayWindows[overlayId]) {
        this.openOverlayWindow(overlayId);
        this.sendOverlayInfoToOverlayWindow(e.sender);
        this.updateTrayContextMenu();
      }
    });
    ipcMain.on(IpcEventKeys.CloseWebOverlay, (e, overlayId: string) => {
      if (this.overlayWindows[overlayId]) {
        this.closeOverlayWindow(overlayId);
        this.sendOverlayInfoToOverlayWindow(e.sender);
        this.updateTrayContextMenu();
      }
    });
    ipcMain.on(IpcEventKeys.ReloadWebOverlay, (e, overlayId: string) => {
      if (this.overlayWindows[overlayId]) {
        this.reloadOverlayWindow(overlayId);
        this.sendOverlayInfoToOverlayWindow(e.sender);
        this.updateTrayContextMenu();
      }
    });
    ipcMain.on(
      IpcEventKeys.IgnoreMouseEventWebOverlay,
      (e, overlayId: string) => {
        this.setIgnoreOverlayWindowMouseEvent(
          overlayId,
          !this.isIgnoreOverlayWindowMouseEvents[overlayId]
        );
        this.sendOverlayInfoToOverlayWindow(e.sender);
        this.updateTrayContextMenu();
      }
    );
    ipcMain.on(IpcEventKeys.EnableMoveWebOverlay, (e, overlayId: string) => {
      this.setEnableMoveOverlayWindowEvent(
        overlayId,
        !this.isEnableOverlayWindowMoves[overlayId]
      );
      this.sendOverlayInfoToOverlayWindow(e.sender);
      this.updateTrayContextMenu();
    });
    ipcMain.on(IpcEventKeys.ShowBorderWebOverlay, (e, overlayId: string) => {
      this.setShowOverlayWindowBorder(
        overlayId,
        !this.isShowOverlayWindowBorders[overlayId]
      );
      this.sendOverlayInfoToOverlayWindow(e.sender);
      this.updateTrayContextMenu();
    });
    ipcMain.on(
      IpcEventKeys.ImportOverlay,
      (e, exportedOverlays: ExportedOverlays) => {
        try {
          ExportedOverlaysValidationSchema.parse(exportedOverlays);
          const { overlays, activeOverlayIds } = exportedOverlays;
          this.overlayWindowPositions = {};
          this.overlayWindowSizes = {};
          this.isIgnoreOverlayWindowMouseEvents = {};
          this.isEnableOverlayWindowMoves = {};
          this.isShowOverlayWindowBorders = {};
          this.overlays = {};
          this.setActiveOverlayIds(activeOverlayIds);
          for (const [
            overlayId,
            {
              overlayPosition,
              overlaySize,
              isIgnoreOverlayWindowMouseEvent,
              isEnableOverlayWindowMove,
              isShowOverlayWindowBorder,
              ...overlay
            },
          ] of Object.entries(overlays)) {
            this.overlayWindowPositions[overlayId] = overlayPosition;
            this.overlayWindowSizes[overlayId] = overlaySize;
            this.isIgnoreOverlayWindowMouseEvents[overlayId] =
              isIgnoreOverlayWindowMouseEvent;
            this.isEnableOverlayWindowMoves[overlayId] =
              isEnableOverlayWindowMove;
            this.isShowOverlayWindowBorders[overlayId] =
              isShowOverlayWindowBorder;
            this.overlays[overlayId] = overlay;
          }
          setStorageValue("overlayPositions", this.overlayWindowPositions);
          setStorageValue("overlaySizes", this.overlayWindowSizes);
          setStorageValue(
            "isIgnoreOverlayWindowMouseEvents",
            this.isIgnoreOverlayWindowMouseEvents
          );
          setStorageValue(
            "isEnableOverlayWindowMoves",
            this.isEnableOverlayWindowMoves
          );
          setStorageValue(
            "isShowOverlayWindowBorders",
            this.isShowOverlayWindowBorders
          );
          setStorageValue("overlays", this.overlays);
          setTimeout(() => {
            app.relaunch();
          }, 100);
        } catch (e) {}
      }
    );
    ipcMain.on(IpcEventKeys.ExportOverlay, (e) => {
      const exportedOverlays: ExportedOverlays = {
        overlays: {},
        activeOverlayIds: this.activeOverlayIds,
      };
      for (const [overlayId, overlay] of Object.entries(this.overlays)) {
        exportedOverlays.overlays[overlayId] = {
          ...overlay,
          overlayPosition: this.overlayWindowPositions[overlayId],
          overlaySize: this.overlayWindowSizes[overlayId],
          isIgnoreOverlayWindowMouseEvent:
            this.isIgnoreOverlayWindowMouseEvents[overlayId],
          isEnableOverlayWindowMove: this.isEnableOverlayWindowMoves[overlayId],
          isShowOverlayWindowBorder: this.isShowOverlayWindowBorders[overlayId],
        };
      }
      e.sender.send(IpcEventKeys.ExportOverlay, exportedOverlays);
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

  private openCheckUpdateWindow() {
    this.checkUpdateWindow = new BrowserWindow({
      width: 300,
      height: 300,
      center: true,
      alwaysOnTop: true,
      title: "업데이트 확인",
      frame: false,
      webPreferences: {
        webSecurity: true,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.checkUpdateWindow.loadFile(DesktopWebOverlayerCheckUpdateHTMLPath);
  }

  private closeCheckUpdateWindow() {
    this.checkUpdateWindow?.close();
  }

  private openSettingsWindow(menu?: string) {
    this.settingsWindow = new BrowserWindow({
      center: true,
      alwaysOnTop: true,
      title: "설정",
      webPreferences: {
        webSecurity: true,
        nodeIntegration: true,
        contextIsolation: false,
        preload: DesktopWebOverlayerPreloadJsPath,
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
          preload: DesktopWebOverlayerPreloadJsPath,
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
        this.updateTrayContextMenu();
      });
      overlayWindow.on("close", () => {
        this.removeActiveOverlayId(overlayId);
        this.updateTrayContextMenu();
        if (this.settingsWindow) {
          this.sendOverlayInfoToOverlayWindow(this.settingsWindow.webContents);
        }
      });
      const showSavePositionSizeButton = () => {
        overlayWindow.webContents.send(IpcEventKeys.ShowPositionSizeSaveButton);
      };
      overlayWindow.on("move", showSavePositionSizeButton);
      overlayWindow.on("moved", showSavePositionSizeButton);
      overlayWindow.on("resize", showSavePositionSizeButton);
      overlayWindow.on("resized", showSavePositionSizeButton);
      windowState.manage(overlayWindow);

      this.overlayWindows[overlayId] = overlayWindow;
      this.overlayWindowStates[overlayId] = windowState;
      this.addActiveOverlayId(overlayId);
      if (this.settingsWindow) {
        this.sendOverlayInfoToOverlayWindow(this.settingsWindow.webContents);
      }
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
      IpcEventKeys.InitWebOverlay,
      overlayId,
      url,
      title
    );
  }

  private setOverlayWindowIframeSrc(overlayId: string, url: string) {
    this.overlayWindows[overlayId].webContents.send(
      IpcEventKeys.SetIframeUrlWebOverlay,
      url
    );
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

  private setActiveOverlayIds(activeOverlayIds: string[]) {
    this.activeOverlayIds = activeOverlayIds;
    setStorageValue("activeOverlayIds", this.activeOverlayIds);
  }

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
      IpcEventKeys.IgnoreMouseEventWebOverlay,
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
      IpcEventKeys.EnableMoveWebOverlay,
      state
    );
    this.isEnableOverlayWindowMoves[overlayId] = state;
    setStorageValue(
      "isEnableOverlayWindowMoves",
      this.isEnableOverlayWindowMoves
    );
  }

  private setShowOverlayWindowBorder(overlayId: string, state: boolean) {
    this.overlayWindows[overlayId].webContents.send(
      IpcEventKeys.ShowBorderWebOverlay,
      state
    );
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

  private sendOverlayInfoToOverlayWindow(webContents: WebContents) {
    webContents.send(
      IpcEventKeys.GetWebOverlayList,
      this.overlays,
      this.activeOverlayIds,
      this.isIgnoreOverlayWindowMouseEvents,
      this.isEnableOverlayWindowMoves,
      this.isShowOverlayWindowBorders
    );
  }
}
