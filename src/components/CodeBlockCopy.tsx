"use client";

import { useEffect } from "react";

export default function CodeBlockCopy() {
  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      ".code-copy-btn"
    );

    const handleClick = (e: Event) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const pre = btn.closest(".code-block-wrapper")?.querySelector("pre");
      const code = pre?.querySelector("code");
      if (!code) return;

      navigator.clipboard.writeText(code.textContent || "").then(() => {
        btn.textContent = "복사됨 ✓";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "복사";
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
