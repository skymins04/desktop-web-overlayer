import { ZodNumber, ZodObject, z } from "zod";
import {
  ExportedOverlay,
  ExportedOverlays,
  WindowPosition,
  WindowSize,
} from "./electronStorage";

export const OverlayWindowPositionValidationSchema: ZodObject<
  Record<keyof WindowPosition, ZodNumber>
> = z.object({
  x: z.number(),
  y: z.number(),
});

export const OverlayWindowSizeValidationSchema: ZodObject<
  Record<keyof WindowSize, ZodNumber>
> = z.object({
  width: z.number(),
  height: z.number(),
});

export const ExportedOverlayValidationSchema: ZodObject<
  Record<keyof ExportedOverlay, any>
> = z.object({
  title: z.string(),
  url: z.string().url(),
  customTheme: z.string().optional(),
  opacity: z.number().min(0).max(100),
  fontSize: z.number().min(0).max(100),
  isEnableFontSize: z.boolean(),
  overlayPosition: OverlayWindowPositionValidationSchema,
  overlaySize: OverlayWindowSizeValidationSchema,
  isIgnoreOverlayWindowMouseEvent: z.boolean(),
  isEnableOverlayWindowMove: z.boolean(),
  isShowOverlayWindowBorder: z.boolean(),
});

export const ExportedOverlaysValidationSchema: ZodObject<
  Record<keyof ExportedOverlays, any>
> = z.object({
  overlays: ExportedOverlayValidationSchema,
  activeOverlayIds: z.array(z.string()),
});
