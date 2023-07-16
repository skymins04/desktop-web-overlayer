import { Overlay } from "@/@types";
import {
  z,
  ZodObject,
  ZodString,
  ZodOptional,
  ZodNumber,
  ZodBoolean,
} from "zod";

export const OverlayFormValidationSchema: ZodObject<
  Record<
    keyof Overlay,
    ZodString | ZodOptional<ZodString> | ZodNumber | ZodBoolean
  >
> = z.object({
  title: z.string().nonempty(),
  url: z.string().url(),
  customTheme: z.string().optional(),
  opacity: z.number().min(0).max(100),
  fontSize: z.number().min(0).max(100),
  isEnableFontSize: z.boolean(),
});
