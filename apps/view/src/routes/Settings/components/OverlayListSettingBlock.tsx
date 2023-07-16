import { Overlays } from "@/@types";
import { SettingBlock } from "@/components";
import { SETTINGS_MENU_DESCRIPTION, SETTINGS_MENU_TITLE } from "@/constants";
import { Button, Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const OverlayListSettingBlock = () => {
  const [, setSearchParams] = useSearchParams();
  const [deleteTargetOverlayId, setDeleteTargetOverlayId] = useState<
    string | null
  >(null);
  const [overlays, setOverlays] = useState<Overlays>({});
  const [activeOverlayIds, setActiveOverlayIds] = useState<string[]>([]);

  const handleCloseDeleteOverlayModal = () => setDeleteTargetOverlayId(null);

  const handleDeleteOverlay = () => {
    handleCloseDeleteOverlayModal();
    if (deleteTargetOverlayId) {
      window.deleteOverlayById(deleteTargetOverlayId);
    }
  };

  useEffect(() => {
    window.addGetOverlayListListener((_overlays, _activeOverlayIds) => {
      setOverlays(_overlays);
      setActiveOverlayIds(_activeOverlayIds);
    });
    window.getOverlayList();
  }, []);

  return (
    <>
      <SettingBlock
        id="overlayList"
        title={SETTINGS_MENU_TITLE.overlayList}
        description={SETTINGS_MENU_DESCRIPTION.overlayList}
      >
        {Object.entries(overlays).map(([key, overlay]) => {
          const isOpen = activeOverlayIds.includes(key);
          return (
            <div
              key={key}
              className="flex items-center justify-between w-full gap-[20px]"
            >
              <div className="flex flex-col items-start justify-center">
                <div className="text-[14px] font-bold text-gray-700">
                  {overlay.title}
                </div>
                <div className="text-[12px] text-gray-500 leading-[1.1em]">
                  {overlay.url}
                </div>
              </div>
              <div className="flex justify-end items-center gap-[5px]">
                {isOpen ? (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => window.closeOverlayById(key)}
                  >
                    닫기
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => window.openOverlayById(key)}
                  >
                    열기
                  </Button>
                )}
                {isOpen && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => window.reloadOverlayById(key)}
                  >
                    새로고침
                  </Button>
                )}
                <Button
                  size="xs"
                  color="red"
                  onClick={() => setDeleteTargetOverlayId(key)}
                >
                  삭제
                </Button>
              </div>
            </div>
          );
        })}
        {Object.entries(overlays).length === 0 && (
          <div className="w-full text-center text-[14px] whitespace-pre-wrap text-gray-500">
            등록된 웹 오버레이가 없습니다.{`\n`}
            <span
              className="inline-block font-bold cursor-pointer hover:underline"
              onClick={() => setSearchParams({ menu: "addOverlay" })}
            >
              "새 웹 오버레이 추가"
            </span>{" "}
            매뉴를 통해 웹 오버레이를 등록하세요.
          </div>
        )}
      </SettingBlock>
      <Modal
        opened={!!deleteTargetOverlayId}
        onClose={handleCloseDeleteOverlayModal}
        title="오버레이 삭제"
        centered
      >
        <div className="w-full text-[14px] text-gray-700">
          정말 오버레이를 삭제하시겠습니까? 삭제된 오버레이는 복구할 수
          없습니다.
        </div>
        <div className="w-full flex justify-end items-center gap-[10px] mt-[10px]">
          <Button color="gray" variant="outline">
            취소
          </Button>
          <Button color="red" onClick={handleDeleteOverlay}>
            삭제
          </Button>
        </div>
      </Modal>
    </>
  );
};
