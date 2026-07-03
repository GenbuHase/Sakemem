import Link from "next/link";
import {
  announcements,
  formatAnnouncementDate,
} from "@/lib/announcements/changelog";

export function ChangelogList() {
  return (
    <div className="space-y-4">
      {announcements.map((entry, index) => (
        <article
          key={entry.id}
          className="rounded-xl border border-zinc-200 bg-white p-5"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-base font-semibold text-zinc-900">
              {entry.title}
            </h2>
            <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
              {entry.id}
            </span>
          </div>
          <time
            dateTime={entry.date}
            className="mt-1 block text-sm text-zinc-500"
          >
            {formatAnnouncementDate(entry.date)}
          </time>
          <p className="mt-3 text-sm leading-relaxed text-zinc-700">
            {entry.body}
          </p>
          {entry.items && entry.items.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-sm text-zinc-600">
              {entry.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-zinc-400">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {entry.link ? (
            <p className="mt-4">
              <Link
                href={entry.link.href}
                className="text-sm font-medium text-zinc-700 underline-offset-2 hover:text-zinc-900 hover:underline"
              >
                {entry.link.label}
              </Link>
            </p>
          ) : null}
          {index === 0 ? (
            <p className="mt-4 text-xs text-zinc-400">最新の更新</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
