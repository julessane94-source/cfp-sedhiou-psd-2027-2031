"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const elements = document.querySelectorAll(
      "main > section, main > article, main > form, main > .ui-card"
    );

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("scroll-visible"));
      return;
    }

    elements.forEach((element) => {
      element.classList.add("scroll-reveal");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  return <>{children}</>;
}
