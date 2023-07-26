export type SettingsMenus =
  | "overlayList"
  | "addOverlay"
  | "editOverlay"
  | "exportSettings"
  | "importSettings";

export const SETTINGS_MENU_TITLE: Record<SettingsMenus, string> = {
  overlayList: "웹 오버레이 목록",
  addOverlay: "새 웹 오버레이 추가",
  editOverlay: "웹 오버레이 수정",
  exportSettings: "설정 내보내기",
  importSettings: "설정 가져오기",
};

export const SETTINGS_MENU_DESCRIPTION: Record<SettingsMenus, string> = {
  overlayList: `등록된 웹페이지 오버레이 목록입니다. "..." 버튼을 통해 오버레이를 삭제/조작할 수 있습니다.`,
  addOverlay:
    "데스크탑 화면 오버레이로 띄울 웹페이지의 URL를 추가할 수 있습니다.",
  editOverlay:
    "등록된 웹 오버레이를 수정 할 수 있습니다.\n창이 열려있는 오버레이의 설정사항을 수정하면 오버레이 창이 새로고침 됩니다.",
  exportSettings:
    "현재 DESKTOP WEB OVERLAYER의 설정사항을 파일로 내보내어 백업할 수 있습니다.",
  importSettings: "내보냈던 설정파일을 통해 설정 복구를 진행할 수 있습니다.",
};
