"use client";

import { useEffect } from "react";

const COPY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

export default function CodeBlockCopy() {
  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      ".code-copy-btn"
    );

    const handleClick = (e: Event) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const wrapper = btn.closest(".code-block-wrapper");
      const code = wrapper?.querySelector("code");
      if (!code) return;

      navigator.clipboard.writeText(code.textContent || "").then(() => {
        btn.innerHTML = CHECK_ICON;
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML = COPY_ICON;
          btn.classList.remove("copied");
        }, 2000);
      });
    };

    buttons.forEach((btn) => btn.addEventListener("click", handleClick));

    return () => {
      buttons.forEach((btn) => btn.removeEventListener("click", handleClick));
    };
  }, []);

  return null;
}
