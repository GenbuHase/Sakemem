import Link from "next/link";
import { cx } from "@/components/ui/styles";

type SiteLogoProps = {
  className?: string;
};

export function SiteLogo({ className }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cx(
        "text-sm font-semibold tracking-widest text-zinc-900 uppercase",
        className,
      )}
    >
      Sakemem
    </Link>
  );
}
