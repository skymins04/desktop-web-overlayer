import { z, ZodObject, ZodString, ZodOptional } from "zod";

export type AddPageFormData = {
  title: string;
  url: string;
  customTheme?: string;
};

export const AddPageFormValidationSchema: ZodObject<
  Record<keyof AddPageFormData, ZodString | ZodOptional<ZodString>>
> = z.object({
  title: z.string().nonempty(),
  url: z.string().url(),
  customTheme: z.string().optional(),
});
