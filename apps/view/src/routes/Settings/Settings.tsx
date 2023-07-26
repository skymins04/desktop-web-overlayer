import { BaseLayout } from "@/components";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SETTINGS_MENU_TITLE, SettingsMenus } from "@/constants/settingsMenu";
import {
  AddOverlaySettingBlock,
  OverlayListSettingBlock,
  SettingsSideArea,
  EditOverlaySettingBlock,
  ExportSettingsSettingBlock,
  ImportSettingsSettingBlock,
} from "./components";

export const Settings = () => {
  const [searchParams] = useSearchParams();
  const menu = searchParams.get("menu") as SettingsMenus | null;

  useEffect(() => {
    if (menu && SETTINGS_MENU_TITLE[menu]) {
      document.getElementById(menu)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [menu]);

  return (
    <BaseLayout sideArea={<SettingsSideArea />}>
      <OverlayListSettingBlock />
      <AddOverlaySettingBlock />
      <EditOverlaySettingBlock />
      <ExportSettingsSettingBlock />
      <ImportSettingsSettingBlock />
    </BaseLayout>
  );
};
