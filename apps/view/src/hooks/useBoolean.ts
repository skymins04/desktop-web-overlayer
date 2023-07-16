import { useCallback, useState } from "react";

export const useBoolean = (initialValue?: boolean) => {
  const [value, setValue] = useState<boolean>(!!initialValue);

  const on = useCallback(() => {
    setValue(true);
  }, [setValue]);
  const off = useCallback(() => {
    setValue(false);
  }, [setValue]);
  const toggle = useCallback(() => {
    setValue((value) => !value);
  }, [setValue]);
  const set = useCallback(
    (value: boolean) => {
      setValue(value);
    },
    [setValue]
  );

  return { value, on, off, toggle, set };
};
