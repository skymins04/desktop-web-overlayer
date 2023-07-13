import { AddPageFormData } from "@/routes/AddPage/validationSchema";

declare global {
  interface Window {
    addWebPage: (page: AddPageFormData) => void;
    updateWindowPosAndSize: () => void;
    closeIframeWindow: () => void;
    urlId: string;
    title: string;
    url: string;
  }
}
