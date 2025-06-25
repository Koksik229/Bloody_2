// utility functions reused across shadcn-ui components
// copied from original design repo or reimplemented

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-aware className merger used in design system components.
 * Works same as in shadcn-ui starter.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
