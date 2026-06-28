import { cx } from "@/components/ui/styles";

type ProfileAvatarProps = {
  displayName: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
} as const;

export function ProfileAvatar({
  displayName,
  avatarUrl,
  size = "md",
}: ProfileAvatarProps) {
  const initial = displayName.trim().charAt(0) || "?";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={cx(
          "shrink-0 rounded-full object-cover",
          sizeClass[size],
        )}
      />
    );
  }

  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-600",
        sizeClass[size],
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
