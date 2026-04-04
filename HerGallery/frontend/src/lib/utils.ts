import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const APP_BASENAME = "/HerGallery";

export function buildExhibitionShareUrl(exhibitionId: number) {
  if (typeof window === "undefined") {
    return `${APP_BASENAME}/exhibition/${exhibitionId}`;
  }

  return `${window.location.origin}${APP_BASENAME}/exhibition/${exhibitionId}`;
}

export function buildSubmissionShareUrl(exhibitionId: number, submissionId: number) {
  return `${buildExhibitionShareUrl(exhibitionId)}?submission=${submissionId}`;
}

export async function copyTextToClipboard(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
