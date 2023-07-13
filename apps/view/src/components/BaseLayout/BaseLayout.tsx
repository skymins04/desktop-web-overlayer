import { ReactNode } from "react";

export type BaseLayoutProps = {
  children: ReactNode;
  sideArea: ReactNode;
};

export const BaseLayout = ({ children, sideArea }: BaseLayoutProps) => {
  return (
    <div className="flex flex-col items-center w-full h-full justify-stretch">
      <div className="w-full h-[56px] border-x-0 border-t-0 border-solid border-gray-200 shadow-sm px-[20px] flex justify-start items-center font-bold text-[24px] text-gray-700">
        DESKTOP WEB OVERLAYER
      </div>
      <div className="flex items-stretch justify-center w-full h-[calc(100vh-56px)]">
        <div className="flex flex-col justify-start items-stretch gap-[4px] scrollbar-none w-[200px] min-w-[200px] h-full border-solid border-y-0 border-l-0 border-gray-200 overflow-x-hidden overflow-y-auto py-[20px] px-[10px]">
          {sideArea}
        </div>
        <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="flex flex-col justify-start items-stretch gap-[10px] w-full h-max p-[20px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
