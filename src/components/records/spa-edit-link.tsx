"use client";

import type { MouseEvent, ReactNode } from "react";

type SpaEditLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function SpaEditLink({
  href,
  className,
  children,
}: SpaEditLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", href);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
