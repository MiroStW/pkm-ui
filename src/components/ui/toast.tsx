"use client";

// Toast component without CVA for simplicity

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

let toastTimeoutId: NodeJS.Timeout | null = null;
let toastEl: HTMLDivElement | null = null;

export function toast({
  title,
  description,
  variant = "default",
  duration = 3000,
}: ToastProps) {
  // Clear any existing toast
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
    if (toastEl?.parentNode) {
      toastEl.setAttribute("data-state", "closed");
      setTimeout(() => {
        toastEl?.parentNode?.removeChild(toastEl);
      }, 300);
    }
  }

  // Create a new toast
  const el = document.createElement("div");
  toastEl = el;

  // Base classes for all toasts
  const baseClasses =
    "fixed flex w-auto max-w-md items-center justify-between gap-2 rounded-md p-4 shadow-lg " +
    "transition-all data-[state=open]:animate-in data-[state=closed]:animate-out " +
    "data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 " +
    "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full";

  // Variant-specific classes
  const variantClasses =
    variant === "destructive"
      ? "bg-destructive text-destructive-foreground"
      : "bg-background text-foreground";

  el.className = `${baseClasses} ${variantClasses}`;
  el.setAttribute("data-state", "open");
  el.style.zIndex = "9999";
  el.style.bottom = "1rem";
  el.style.right = "1rem";

  // Add content
  if (title) {
    const titleEl = document.createElement("h3");
    titleEl.className = "text-sm font-semibold";
    titleEl.textContent = title;
    el.appendChild(titleEl);
  }

  if (description) {
    const descEl = document.createElement("p");
    descEl.className = "text-sm";
    descEl.textContent = description;
    el.appendChild(descEl);
  }

  // Add to document
  document.body.appendChild(el);

  // Set timeout to remove
  toastTimeoutId = setTimeout(() => {
    el.setAttribute("data-state", "closed");
    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      if (toastEl === el) {
        toastEl = null;
      }
    }, 300);
  }, duration);
}
