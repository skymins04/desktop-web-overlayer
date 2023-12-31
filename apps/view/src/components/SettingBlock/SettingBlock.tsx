import classNames from "classnames";
import { ReactNode } from "react";

export type SettingBlockProps = {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  footerClassName?: string;
  contentClassName?: string;
  title?: string;
  description?: string;
  id: string;
};

export const SettingBlock = ({
  children,
  className,
  footer,
  footerClassName,
  title,
  description,
  id,
}: SettingBlockProps) => {
  return (
    <div
      id={id}
      className="w-full h-max flex flex-col justify-center items-stretch gap-[10px]"
    >
      {(title || description) && (
        <div className="w-full">
          {title && <h1 className="text-[18px] text-gray-700">{title}</h1>}
          {description && (
            <p className="text-[14px] text-gray-500 whitespace-pre-wrap">
              {description}
            </p>
          )}
        </div>
      )}
      <div
        className={classNames(
          "w-full h-max min-h-max shadow-md rounded-[6px]",
          className
        )}
      >
        <div
          className={classNames(
            "w-full relative p-[20px] bg-white flex flex-col justify-center items-center gap-[10px] rounded-t-[6px]",
            !footer && "rounded-b-[6px]"
          )}
        >
          {children}
        </div>
        {footer && (
          <div
            className={classNames(
              "w-full relative px-[20px] py-[10px] flex justify-end items-center gap-[10px] bg-gray-300 rounded-b-[6px]",
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
