import Link from "next/link";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";

type SharedRecordAuthorProps = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export function SharedRecordAuthor({
  username,
  displayName,
  avatarUrl,
}: SharedRecordAuthorProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Link href={`/@${username}`} className="flex items-center gap-2">
        <ProfileAvatar
          displayName={displayName}
          avatarUrl={avatarUrl}
          size="sm"
        />
        <span className="text-sm text-zinc-700">
          {displayName}
          <span className="text-zinc-400"> @{username}</span>
        </span>
      </Link>
    </div>
  );
}
