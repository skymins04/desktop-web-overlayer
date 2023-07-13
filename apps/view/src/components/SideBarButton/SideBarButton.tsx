import {
  ButtonHTMLAttributes,
  Children,
  DetailedHTMLProps,
  ReactNode,
  cloneElement,
  isValidElement,
  useMemo,
} from "react";
import classNames from "classnames";

export type SideBarButtonProps = {
  icon?: ReactNode;
  hoveredIcon?: ReactNode;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const SideBarButton = ({
  icon,
  hoveredIcon,
  className,
  children,
  ...props
}: SideBarButtonProps) => {
  const iconWithProps = useMemo(
    () =>
      Children.map(icon, (child) => {
        if (isValidElement(child)) {
          cloneElement<any>(child, { sx: { fontSize: "100%" } });
        }
        return child;
      }),
    [icon]
  );
  const hoveredWithProps = useMemo(
    () =>
      Children.map(hoveredIcon, (child) => {
        if (isValidElement(child)) {
          cloneElement<any>(child, { sx: { fontSize: "100%" } });
        }
        return child;
      }),
    [hoveredIcon]
  );

  return (
    <button
      {...props}
      className={classNames(
        "group w-full px-[10px] py-[10px] rounded-[6px] bg-white hover:bg-gray-100 active:bg-gray-200 duration-200 text-[14px] text-gray-700 border-none cursor-pointer flex justify-start items-center font-bold gap-[10px]",
        className
      )}
    >
      {iconWithProps && (
        <div className="w-[24px] h-[24px] flex justify-stretch items-stretch relative">
          <div
            className={classNames(
              "absolute top-0 left-0 w-[24px] h-[24px] text-[24px] flex justify-center items-center opacity-100 duration-200",
              hoveredWithProps && "group-hover:opacity-0"
            )}
          >
            {iconWithProps}
          </div>
          {hoveredWithProps && (
            <div className="absolute top-0 left-0 w-[24px] h-[24px] text-[24px] flex justify-center items-center opacity-0 group-hover:opacity-100 duration-200">
              {hoveredWithProps}
            </div>
          )}
        </div>
      )}
      {children}
    </button>
  );
};
