import { Divider, SettingBlock } from "@/components";
import { SETTINGS_MENU_DESCRIPTION, SETTINGS_MENU_TITLE } from "@/constants";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";

const extractFileName = (filePath: string): string | null => {
  const regex = /[\\/]?([^\\/]+)$/;

  const match = filePath.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};

const removeFileExtension = (fileName: string): string => {
  const regex = /(\.[^.\\/]+)$/;

  const match = fileName.match(regex);
  if (match) {
    return fileName.slice(0, -match[1].length);
  } else {
    return fileName;
  }
};

export const ImportSettingsSettingBlock = () => {
  const [settingFileHistory, setSettingFileHistory] = useState<string[]>([]);

  const handleImportOverlays = (filePath?: string) => () => {
    window.importOverlays((result) => {
      if (result === "success") {
        notifications.show({
          title: "설정 가져오기 성공",
          message: "정상적으로 설정사항을 가져왔습니다.",
        });
      } else if (result === "fail") {
        notifications.show({
          color: "red",
          title: "설정 가져오기 실패",
          message: "유효하지 않은 설정파일입니다.",
        });
      }
    }, filePath);
  };

  const handleDeleteSettingHistory = (index: number) => () => {
    window.deleteSettingHistory(index);
  };

  useEffect(() => {
    const handleGetSettingFileHistory = (
      _a: any,
      _b: any,
      _c: any,
      _d: any,
      _e: any,
      history: string[]
    ) => {
      setSettingFileHistory(history || []);
    };
    window.addGetOverlayListListener(handleGetSettingFileHistory);
    window.getOverlayList();

    return () => {
      window.removeGetOverlayListListener(handleGetSettingFileHistory);
    };
  }, []);

  return (
    <SettingBlock
      id="importSettings"
      title={SETTINGS_MENU_TITLE.importSettings}
      description={SETTINGS_MENU_DESCRIPTION.importSettings}
      footer={
        <Button size="xs" onClick={handleImportOverlays()}>
          새 설정파일 가져오기
        </Button>
      }
    >
      <div className="w-full">
        <h2 className="text-[16px] w-full mb-[4px]">설정 파일 히스토리</h2>
        <div className="text-[14px] leading-[1.2em] text-gray-500">
          설정 내보내고, 가져왔던 파일들의 히스토리를 제공합니다.
        </div>
        <div className="w-full leading-[1.2em] text-[14px] break-all text-red-500">
          설정파일 가져오기 적용시 현재 DESKTOP WEB OVERLAYER의 설정사항은
          제거되므로 주의하세요.
        </div>
      </div>

      <Divider />

      {settingFileHistory.length === 0 ? (
        <div className="w-full py-[20px] text-center text-gray-500 text-[14px]">
          설정 파일 히스토리가 없습니다.
        </div>
      ) : (
        settingFileHistory
          .map(
            (filePath) =>
              [extractFileName(filePath) || "파일명없음", filePath] as [
                string,
                string
              ]
          )
          .map(([fileName, filePath], index) => (
            <div className="flex justify-start items-center gap-[10px] w-full">
              <div className="flex flex-col justify-center items-start w-full max-w-[calc(100%-160px)] leading-[1em]">
                <div className="text-[14px] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {removeFileExtension(fileName)}
                </div>
                <div className="text-[12px] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {filePath}
                </div>
              </div>
              <div className="flex items-center justify-end gap-[5px]">
                <Button
                  size="xs"
                  variant="outline"
                  color="red"
                  onClick={handleDeleteSettingHistory(index)}
                >
                  목록에서 삭제
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleImportOverlays(filePath)}
                >
                  적용
                </Button>
              </div>
            </div>
          ))
      )}
    </SettingBlock>
  );
};
