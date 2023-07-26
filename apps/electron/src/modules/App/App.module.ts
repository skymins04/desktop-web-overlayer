import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import {
  BrowserWindow,
  Menu,
  Tray,
  app,
  nativeImage,
  ipcMain,
  WebContents,
  dialog,
} from "electron";
import { autoUpdater } from "electron-updater";
import electronWindowState, { State } from "electron-window-state";
import { uuid } from "uuidv4";
import donwloadFolder from "downloads-folder";
import {
  DesktopWebOverlayerIndexHTMLPath,
  logoImagePath,
  title,
  titleVersion,
  DesktopWebOverlayerSettingsAddOverlayHTMLPath,
  DesktopWebOverlayerSettingsHTMLPath,
  IpcEventKeys,
  DesktopWebOverlayerCheckUpdateHTMLPath,
  DesktopWebOverlayerPreloadSettingsWindowJsPath,
  DesktopWebOverlayerPreloadOverlayWindowJsPath,
} from "@constants";
import { ExportedOverlaysValidationSchema } from "@utils";
import {
  StoreModule,
  Overlay,
  Overlays,
  ExportedOverlays,
  WindowPositions,
  WindowSizes,
  WindowBooleans,
} from "@modules";

export class AppModule {
  constructor(private readonly store: StoreModule) {
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
   * Initializers
   *************************************************************/

  private init() {
    this.initIpcListeners();
    this.initWindows();
    this.initTray();
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
          !this.store.isIgnoreOverlayWindowMouseEvents[overlayId]
        );
        this.sendOverlayInfoToOverlayWindow(e.sender);
        this.updateTrayContextMenu();
      }
    );
    ipcMain.on(IpcEventKeys.EnableMoveWebOverlay, (e, overlayId: string) => {
      this.setEnableMoveOverlayWindowEvent(
        overlayId,
        !this.store.isEnableOverlayWindowMoves[overlayId]
      );
      this.sendOverlayInfoToOverlayWindow(e.sender);
      this.updateTrayContextMenu();
    });
    ipcMain.on(IpcEventKeys.ShowBorderWebOverlay, (e, overlayId: string) => {
      this.setShowOverlayWindowBorder(
        overlayId,
        !this.store.isShowOverlayWindowBorders[overlayId]
      );
      this.sendOverlayInfoToOverlayWindow(e.sender);
      this.updateTrayContextMenu();
    });
    ipcMain.on(
      IpcEventKeys.ImportOverlay,
      async (e, exportedFilePath?: string) => {
        const sendImportOverlayResult = (
          result: "success" | "fail" | "cancel"
        ) => e.sender.send(IpcEventKeys.ImportOverlay, result);

        if (this.settingsWindow) {
          const filePath =
            exportedFilePath ??
            (await dialog
              .showOpenDialog(this.settingsWindow, {
                title: "설정파일 가져오기",
                properties: ["openFile"],
              })
              .then(({ filePaths }) => {
                const [filePath] = filePaths;
                if (filePath) {
                  return filePath;
                } else {
                  sendImportOverlayResult("cancel");
                  return null;
                }
              })
              .catch(() => {
                sendImportOverlayResult("fail");
                return null;
              }));

          if (filePath) {
            try {
              const exportedOverlays: ExportedOverlays = JSON.parse(
                readFileSync(filePath).toString()
              );
              ExportedOverlaysValidationSchema.parse(exportedOverlays);
              for (const [overlayId, overlayWindow] of Object.entries(
                this.overlayWindows
              )) {
                overlayWindow.close();
                delete this.overlayWindows[overlayId];
              }
              const { overlays, activeOverlayIds } = exportedOverlays;
              const newOverlayWindowPositions: WindowPositions = {};
              const newOverlayWindowSizes: WindowSizes = {};
              const newIsIgnoreOverlayWindowMouseEvents: WindowBooleans = {};
              const newIsEnableOverlayWindowMoves: WindowBooleans = {};
              const newIsShowOverlayWindowBorders: WindowBooleans = {};
              const newOverlays: Overlays = {};

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
                newOverlayWindowPositions[overlayId] = overlayPosition;
                newOverlayWindowSizes[overlayId] = overlaySize;
                newIsIgnoreOverlayWindowMouseEvents[overlayId] =
                  isIgnoreOverlayWindowMouseEvent ?? false;
                newIsEnableOverlayWindowMoves[overlayId] =
                  isEnableOverlayWindowMove ?? true;
                newIsShowOverlayWindowBorders[overlayId] =
                  isShowOverlayWindowBorder ?? true;
                newOverlays[overlayId] = overlay;
              }

              this.store.overlayWindowPositions = newOverlayWindowPositions;
              this.store.overlayWindowSizes = newOverlayWindowSizes;
              this.store.isIgnoreOverlayWindowMouseEvents =
                newIsIgnoreOverlayWindowMouseEvents;
              this.store.isEnableOverlayWindowMoves =
                newIsEnableOverlayWindowMoves;
              this.store.isShowOverlayWindowBorders =
                newIsShowOverlayWindowBorders;
              this.store.overlays = newOverlays;
              this.store.activeOverlayIds = activeOverlayIds;

              if (!this.store.settingFileHistory.includes(filePath)) {
                this.store.settingFileHistory = [
                  ...this.store.settingFileHistory,
                  filePath,
                ];
              }

              this.openActiveOverlayWindows();
              this.sendOverlayInfoToOverlayWindow(e.sender);
              sendImportOverlayResult("success");
            } catch (e) {
              sendImportOverlayResult("fail");
            }
          }
        } else {
          sendImportOverlayResult("cancel");
        }
      }
    );
    ipcMain.on(IpcEventKeys.ExportOverlay, (e) => {
      const sendExportOverlayResult = (result: "success" | "fail" | "cancel") =>
        e.sender.send(IpcEventKeys.ExportOverlay, result);

      if (this.settingsWindow) {
        const exportedOverlays: ExportedOverlays = {
          overlays: {},
          activeOverlayIds: this.store.activeOverlayIds,
        };
        for (const [overlayId, overlay] of Object.entries(
          this.store.overlays
        )) {
          exportedOverlays.overlays[overlayId] = {
            ...overlay,
            overlayPosition: this.store.overlayWindowPositions[overlayId],
            overlaySize: this.store.overlayWindowSizes[overlayId],
            isIgnoreOverlayWindowMouseEvent:
              this.store.isIgnoreOverlayWindowMouseEvents[overlayId],
            isEnableOverlayWindowMove:
              this.store.isEnableOverlayWindowMoves[overlayId],
            isShowOverlayWindowBorder:
              this.store.isShowOverlayWindowBorders[overlayId],
          };
        }
        const date = new Date();
        dialog
          .showSaveDialog(this.settingsWindow, {
            title: "설정파일 내보내기",
            defaultPath: join(
              donwloadFolder(),
              `desktop-web-overlayer_${date.getFullYear()}-${(
                date.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}-${date
                .getDate()
                .toString()
                .padStart(2, "0")}.json`
            ),
            buttonLabel: "저장",
          })
          .then(({ filePath }) => {
            if (filePath) {
              writeFileSync(filePath, JSON.stringify(exportedOverlays));
              if (!this.store.settingFileHistory.includes(filePath)) {
                this.store.settingFileHistory = [
                  ...this.store.settingFileHistory,
                  filePath,
                ];
              }

              this.sendOverlayInfoToOverlayWindow(e.sender);
              sendExportOverlayResult("success");
            } else {
              sendExportOverlayResult("cancel");
            }
          })
          .catch(() => {
            sendExportOverlayResult("fail");
          });
      }
    });
    ipcMain.on(IpcEventKeys.DeleteSettingHistory, (e, index: number) => {
      const length = this.store.settingFileHistory.length;
      if (length > index && index >= 0) {
        const newHistory = [...this.store.settingFileHistory];
        newHistory.splice(index, 1);
        this.store.settingFileHistory = newHistory;
        this.sendOverlayInfoToOverlayWindow(e.sender);
      }
    });
  }

  private initWindows() {
    if (
      this.store.activeOverlayIds.length === 0 &&
      Object.keys(this.store.overlays).length === 0
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

  private updateActiveOverlays() {
    this.store.activeOverlayIds = (
      Array.isArray(this.store.activeOverlayIds)
        ? this.store.activeOverlayIds
        : []
    ).filter((activeOverlayId) => !!this.store.overlays[activeOverlayId]);
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
    this.store.overlayWindowPositions = {
      ...this.store.overlayWindowPositions,
      [overlayId]: overlayWindowPosition,
    };
  }

  private updateWindowSize(overlayId: string, overlayWindow: BrowserWindow) {
    const size = overlayWindow.getSize();
    const overlayWindowSize = { width: size[0], height: size[1] };
    this.store.overlayWindowSizes = {
      ...this.store.overlayWindowSizes,
      [overlayId]: overlayWindowSize,
    };
  }

  private updateTrayContextMenu() {
    const trayMenus = Menu.buildFromTemplate([
      { label: titleVersion, type: "normal" },
      { type: "separator" },
      {
        label: "마우스 클릭 통과",
        type: "submenu",
        submenu: Object.entries(this.store.isIgnoreOverlayWindowMouseEvents)
          .filter(([overlayId, _]) =>
            this.store.activeOverlayIds.includes(overlayId)
          )
          .map(([overlayId, value]) => ({
            label: this.store.overlays[overlayId].title,
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
        submenu: Object.entries(this.store.isEnableOverlayWindowMoves)
          .filter(([overlayId, _]) =>
            this.store.activeOverlayIds.includes(overlayId)
          )
          .map(([overlayId, value]) => ({
            label: this.store.overlays[overlayId].title,
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
        submenu: Object.entries(this.store.isShowOverlayWindowBorders)
          .filter(([overlayId, _]) =>
            this.store.activeOverlayIds.includes(overlayId)
          )
          .map(([overlayId, value]) => ({
            label: this.store.overlays[overlayId].title,
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
        submenu: this.store.activeOverlayIds.map((overlayId) => ({
          label: this.store.overlays[overlayId].title,
          type: "normal",
          click: () => this.reloadOverlayWindow(overlayId),
        })),
      },
      { type: "separator" },
      {
        label: "웹페이지 열기/닫기",
        type: "submenu",
        submenu: Object.entries(this.store.overlays).map(([key, url]) => {
          const isActive = this.store.activeOverlayIds.includes(key);
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
        submenu: this.store.activeOverlayIds.map((overlayId) => ({
          label: this.store.overlays[overlayId].title,
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
    if (this.settingsWindow) return;
    this.settingsWindow = new BrowserWindow({
      width: 800,
      center: true,
      alwaysOnTop: true,
      title: "설정",
      webPreferences: {
        webSecurity: true,
        nodeIntegration: true,
        contextIsolation: false,
        preload: DesktopWebOverlayerPreloadSettingsWindowJsPath,
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
    const overlay = this.store.overlays[overlayId];
    if (overlay) {
      const windowState = electronWindowState({
        defaultWidth: 500,
        defaultHeight: 500,
      });
      const overlayWindow = new BrowserWindow({
        width:
          this.store.overlayWindowSizes[overlayId]?.width || windowState.width,
        height:
          this.store.overlayWindowSizes[overlayId]?.height ||
          windowState.height,
        x: this.store.overlayWindowPositions[overlayId]?.x || windowState.x,
        y: this.store.overlayWindowPositions[overlayId]?.y || windowState.y,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        title: title,
        opacity: overlay.opacity / 100,
        webPreferences: {
          webSecurity: true,
          nodeIntegration: true,
          contextIsolation: false,
          preload: DesktopWebOverlayerPreloadOverlayWindowJsPath,
        },
      });
      this.ignoreXFrameOptionsHeader(overlayWindow);
      this.setWindowLangaugeToKR(overlayWindow);

      if (this.store.isIgnoreOverlayWindowMouseEvents[overlayId] === undefined)
        this.store.isIgnoreOverlayWindowMouseEvents[overlayId] = false;
      if (this.store.isEnableOverlayWindowMoves[overlayId] === undefined)
        this.store.isEnableOverlayWindowMoves[overlayId] = true;
      if (this.store.isShowOverlayWindowBorders[overlayId] === undefined)
        this.store.isShowOverlayWindowBorders[overlayId] = true;

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
          this.store.isIgnoreOverlayWindowMouseEvents[overlayId]
        );
        this.setEnableMoveOverlayWindowEvent(
          overlayId,
          this.store.isEnableOverlayWindowMoves[overlayId]
        );
        this.setShowOverlayWindowBorder(
          overlayId,
          this.store.isShowOverlayWindowBorders[overlayId]
        );
        this.initOverlayWindow(overlayId, overlay.url, overlay.title);
        this.setOverlayWindowIframeSrc(overlayId, overlay.url);
        this.updateTrayContextMenu();
      });
      overlayWindow.on("close", () => {
        this.removeActiveOverlayId(overlayId);
        delete this.overlayWindows[overlayId];
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
    for (const overlayId of this.store.activeOverlayIds) {
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
    this.store.overlays = { ...this.store.overlays, [uuid()]: overlay };
  };

  private removeOverlay = (overlayId: string) => {
    if (this.store.overlays[overlayId]) {
      const newOverlays = { ...this.store.overlays };
      delete newOverlays[overlayId];

      this.store.overlays = newOverlays;
      this.updateActiveOverlays();

      const overlayWindow = this.overlayWindows[overlayId];
      if (overlayWindow) {
        overlayWindow.close();
        delete this.overlayWindows[overlayId];
      }
    }
  };

  private editOverlay = (overlayId: string, overlay: Overlay) => {
    if (this.store.overlays[overlayId]) {
      this.store.overlays = { ...this.store.overlays, [overlayId]: overlay };
      this.reloadOverlayWindow(overlayId);
    }
  };

  private addActiveOverlayId(overlayId: string) {
    if (!this.store.activeOverlayIds.includes(overlayId)) {
      this.store.activeOverlayIds = [...this.store.activeOverlayIds, overlayId];
    }
  }

  private removeActiveOverlayId(overlayId: string) {
    this.store.activeOverlayIds = this.store.activeOverlayIds.filter(
      (id) => id !== overlayId
    );
  }

  private setIgnoreOverlayWindowMouseEvent(overlayId: string, state: boolean) {
    this.overlayWindows[overlayId].setIgnoreMouseEvents(state);
    this.overlayWindows[overlayId].webContents.send(
      IpcEventKeys.IgnoreMouseEventWebOverlay,
      state
    );
    this.store.isIgnoreOverlayWindowMouseEvents[overlayId] = state;
  }

  private setEnableMoveOverlayWindowEvent(overlayId: string, state: boolean) {
    this.overlayWindows[overlayId].webContents.send(
      IpcEventKeys.EnableMoveWebOverlay,
      state
    );
    this.store.isEnableOverlayWindowMoves[overlayId] = state;
  }

  private setShowOverlayWindowBorder(overlayId: string, state: boolean) {
    this.overlayWindows[overlayId].webContents.send(
      IpcEventKeys.ShowBorderWebOverlay,
      state
    );
    this.store.isShowOverlayWindowBorders[overlayId] = state;
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
      this.store.overlays,
      this.store.activeOverlayIds,
      this.store.isIgnoreOverlayWindowMouseEvents,
      this.store.isEnableOverlayWindowMoves,
      this.store.isShowOverlayWindowBorders,
      this.store.settingFileHistory
    );
  }
}
