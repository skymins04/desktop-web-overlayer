import classNames from "classnames";
import { ReactNode } from "react";

export type SettingBlockItemRowProps = {
  title: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
  isError?: boolean;
};

export const SettingBlockItemRow = ({
  title,
  required,
  description,
  children,
  isError,
}: SettingBlockItemRowProps) => {
  return (
    <div className="flex items-start justify-between gap-[20px] w-full">
      <div className="w-[120px] min-w-[120px] font-bold text-right">
        {required && (
          <span className="inline-block text-red-500 mr-[2px]">{"*"}</span>
        )}
        {title}
      </div>
      <div className="w-full flex flex-col justify-start items-start gap-[6px]">
        <div className="w-full">{children}</div>
        <p
          className={classNames(
            "w-full whitespace-pre-wrap text-[12px]",
            isError ? "text-red-500" : "text-gray-500"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
