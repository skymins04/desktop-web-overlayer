import { SettingBlock } from "@/components";
import { SETTINGS_MENU_DESCRIPTION, SETTINGS_MENU_TITLE } from "@/constants";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export const ExportSettingsSettingBlock = () => {
  const handleExportOverlays = () =>
    window.exportOverlays((result) => {
      if (result === "success") {
        notifications.show({
          title: "설정 내보내기 완료!",
          message:
            "현재 DESKTOP WEB OVERLAYER의 설정사항을 백업한 파일을 저장했어요.",
        });
      } else if (result === "fail") {
        notifications.show({
          color: "red",
          title: "설정 내보내기 실패",
          message: "설정 내보내기를 실패했어요. 다시 시도해주세요.",
        });
      }
    });

  return (
    <SettingBlock
      id="exportSettings"
      title={SETTINGS_MENU_TITLE.exportSettings}
      description={SETTINGS_MENU_DESCRIPTION.exportSettings}
      footer={
        <Button size="xs" onClick={handleExportOverlays}>
          새 설정파일 내보내기
        </Button>
      }
    >
      <div className="w-full text-[14px] break-all text-gray-700 whitespace-pre-wrap">
        {`설정파일을 내보내면 오버레이에 대한 모든 배치 정보를 파일로 저장할 수 있습니다.\n내보낸 설정파일들은 "설정 가져오기"를 통해 오버레이 배치 프리셋처럼 사용하거나 설정을 복구하는 목적으로 사용할 수 있습니다.`}
      </div>
    </SettingBlock>
  );
};
