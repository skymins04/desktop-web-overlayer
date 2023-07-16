import { Overlays } from "@/@types";
import { SettingBlock } from "@/components";
import { SETTINGS_MENU_DESCRIPTION, SETTINGS_MENU_TITLE } from "@/constants";
import { Button, Menu, Modal } from "@mantine/core";
import {
  DeleteOutline,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  MoreVert,
  Replay,
} from "@mui/icons-material";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const overlayCropListItemMaxCount = 5;

export const OverlayListSettingBlock = () => {
  const [, setSearchParams] = useSearchParams();
  const [deleteTargetOverlayId, setDeleteTargetOverlayId] = useState<
    string | null
  >(null);
  const [overlays, setOverlays] = useState<Overlays>({});
  const [activeOverlayIds, setActiveOverlayIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllList, setShowAllList] = useState(false);

  const totalPageCount = Math.ceil(
    Object.keys(overlays).length / overlayCropListItemMaxCount
  );
  const isAvailableIncrease = currentPage < totalPageCount;
  const isAvailableDecrease = currentPage > 1;

  const handleReloadOverlay = (key: string) => () =>
    window.reloadOverlayById(key);

  const handleCloseDeleteOverlayModal = () => setDeleteTargetOverlayId(null);

  const handleSetTargetDeleteOverlay = (key: string) => () =>
    setDeleteTargetOverlayId(key);

  const handleDeleteOverlay = () => {
    handleCloseDeleteOverlayModal();
    if (deleteTargetOverlayId) {
      window.deleteOverlayById(deleteTargetOverlayId);
    }
  };

  const handleToggleListExpand = () => {
    setShowAllList((state) => !state);
    setCurrentPage(1);
  };

  const handleIncreaseCurrentPage = () => {
    setCurrentPage((state) => state + 1);
  };

  const handleDecreaseCurrentPage = () => {
    setCurrentPage((state) => state - 1);
  };

  useEffect(() => {
    window.addGetOverlayListListener((_overlays, _activeOverlayIds) => {
      setOverlays(_overlays);
      setActiveOverlayIds(_activeOverlayIds);
      setCurrentPage(1);
    });
    window.getOverlayList();
  }, []);

  return (
    <>
      <SettingBlock
        id="overlayList"
        title={SETTINGS_MENU_TITLE.overlayList}
        description={SETTINGS_MENU_DESCRIPTION.overlayList}
        footerClassName="justify-between"
        footer={
          <>
            <Button
              className="px-0 w-[90px]"
              size="xs"
              color="blue"
              variant="outline"
              onClick={handleToggleListExpand}
            >
              {showAllList ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              {showAllList ? "접어보기" : "펼쳐보기"}
            </Button>
            {!showAllList && (
              <div className="flex justify-end items-center gap-[10px]">
                <Button
                  className="w-[30px] px-0"
                  size="xs"
                  color="blue"
                  variant="outline"
                  onClick={handleDecreaseCurrentPage}
                  disabled={!isAvailableDecrease}
                >
                  <KeyboardArrowLeft />
                </Button>
                <div className="flex justify-center items-center gap-[8px] text-gray-500">
                  <span className="font-bold text-gray-700">{currentPage}</span>
                  <span>/</span>
                  <span>{totalPageCount}</span>
                </div>
                <Button
                  className="w-[30px] px-0"
                  size="xs"
                  color="blue"
                  variant="outline"
                  onClick={handleIncreaseCurrentPage}
                  disabled={!isAvailableIncrease}
                >
                  <KeyboardArrowRight />
                </Button>
              </div>
            )}
          </>
        }
      >
        {Object.entries(overlays)
          .slice(
            showAllList ? 0 : currentPage * 5 - 5,
            showAllList ? 999999999999 : currentPage * 5
          )
          .map(([key, overlay]) => {
            const isOpen = activeOverlayIds.includes(key);
            return (
              <div
                key={key}
                className="flex items-center justify-between w-full gap-[20px]"
              >
                <div
                  className={classNames(
                    "relative flex flex-col items-start justify-center",
                    isOpen ? "w-[calc(100%-163px)]" : "w-[calc(100%-126px)]"
                  )}
                >
                  <div className="text-[14px] font-bold text-gray-700 whitespace-nowrap overflow-hidden w-full max-w-full text-ellipsis">
                    {overlay.title}
                  </div>
                  <div className="text-[12px] text-gray-500 leading-[1.1em] break-all line-clamp-2 overflow-hidden">
                    {overlay.url}
                  </div>
                </div>
                <div className="flex justify-end items-center gap-[5px] w-max">
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
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <Button
                        size="xs"
                        variant="outline"
                        className="px-0 w-[30px]"
                      >
                        <MoreVert fontSize="small" />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {isOpen && (
                        <>
                          <Menu.Item
                            icon={<Replay fontSize="small" />}
                            onClick={handleReloadOverlay(key)}
                          >
                            오버레이 새로고침
                          </Menu.Item>
                          <Menu.Divider />
                        </>
                      )}
                      <Menu.Item
                        color="red"
                        icon={<DeleteOutline fontSize="small" />}
                        onClick={handleSetTargetDeleteOverlay(key)}
                      >
                        오버레이 삭제
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
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
