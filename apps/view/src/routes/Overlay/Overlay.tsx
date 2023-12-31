import { notifications } from "@mantine/notifications";
import classNames from "classnames";
import { useEffect, useState } from "react";

export const Overlay = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [urlInfo, setUrlInfo] = useState<{
    url: string;
    urlId: string;
    title: string;
  } | null>(null);

  const handleClose = () => {
    window.close();
  };

  const handleupdateWindowPosAndSize = () => {
    window.updateWindowPosAndSize();
    document.querySelector("html")?.classList.remove("need-save");
    notifications.show({
      title: "창 크기/위치 저장 완료!",
      message:
        "오버레이 창의 크기와 위치가 저장되었어요. 창을 닫거나 프로그램을 종료한 이후 다시 실행해도 창의 위치가 보존돼요.",
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
  }, []);

  useEffect(() => {
    setUrlInfo({
      url: window.url || "",
      urlId: window.urlId || "",
      title: window.title || "",
    });
  }, [window.url, window.urlId, window.title]);

  return (
    <>
      <div
        id="frame-top"
        className="hidden [.draggable_&]:flex justify-stretch items-stretch w-full h-[30px] bg-gray-600 text-white font-bold text-[14px] pr-[40px] [.need-save_&]:pr-[145px] select-none fixed top-0 left-0"
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-full max-w-[calc(100%-40px)] overflow-hidden whitespace-nowrap text-center text-ellipsis">
            {urlInfo?.title || "Desktop Web Overlayer"}
          </div>
        </div>
      </div>
      <button
        className="hidden [.draggable_&]:flex justify-center items-center absolute top-[5px] right-[5px] w-[20px] h-[20px] p-0 z-40 cursor-pointer text-[10px]"
        onClick={handleClose}
      >
        x
      </button>
      <button
        className="hidden [.need-save.draggable_&]:flex justify-center items-center absolute top-[5px] right-[30px] w-[100px] h-[20px] p-0 z-40 cursor-pointer text-[10px]"
        onClick={handleupdateWindowPosAndSize}
      >
        창 크기/위치 저장
      </button>
      <iframe
        id="iframe"
        className="w-full h-[100vh] border-none [.show-border_&]:!border-solid [.show-border_&]:!border-[1px] [.show-border_&]:!border-red-500 "
      ></iframe>
      <div
        className={classNames(
          "fixed top-0 left-0 w-full h-full bg-white duration-1000 flex justify-center items-center text-[28px] font-bold text-teal-700 pointer-events-none text-center z-50",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      >
        DESKTOP WEB OVERLAYER
      </div>
    </>
  );
};
