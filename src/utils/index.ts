import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const APP_NAME = "AutoCert";

export const DOMAIN = process.env.DOMAIN ?? "http://localhost:3000";

export const SIGNATURE_COOKIE_NAME = `${APP_NAME.toLowerCase()}_sig`;
export const SIGNATURE_AES_COOKIE_NAME = `${SIGNATURE_COOKIE_NAME}_aes_key`;

export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:8080";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
