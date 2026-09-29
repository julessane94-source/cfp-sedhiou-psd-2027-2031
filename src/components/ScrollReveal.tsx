"use client";

import { useEffect, type ReactNode } from "react";

export default function ScrollReveal({ children }: { children: ReactNode }) {
  useEffect(() => {
    const elements = document.querySelectorAll(
      "main section, main article, main .ui-card, main .ui-table-wrap, main .table-wrap, main form, main .dashboard-stat"
    );

    elements.forEach((element) => {
      element.classList.add("scroll-reveal");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "scroll-visible",
            entry.isIntersecting
          );
        });
      },
      {
        threshold: 0.12,
        rootMargin: "-8% 0px -8% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
