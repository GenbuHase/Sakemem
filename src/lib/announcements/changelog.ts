import type { Announcement } from "./types";

export const announcements: Announcement[] = [
  {
    id: "alpha-0.4.1",
    date: "2026-07-04",
    title: "更新情報のお知らせを追加しました",
    body: "タイムライン上部にお知らせバナーを表示し、過去の更新履歴も確認できるようになりました。",
    items: [
      "タイムライン上部に未読の更新お知らせバナーを表示",
      "「閉じる」で既読にでき、次のバージョンまで非表示",
      "更新情報ページ（/changelog）で過去の変更履歴を一覧表示",
      "アカウントメニューから更新情報ページへアクセス可能",
    ],
    link: { href: "/changelog", label: "更新情報を見る" },
  },
  {
    id: "alpha-0.4.0",
    date: "2026-07-04",
    title: "タイムラインと共有まわりを再設計しました",
    body: "カード表示や共有の操作感を見直しました。",
    items: [
      "タイムラインのカード表示を再設計",
      "共有ボタンの操作を見直し",
    ],
  },
  {
    id: "alpha-0.3.18",
    date: "2026-07-04",
    title: "共有ボタンの表示を改善しました",
    body: "SNS への共有ラベルを分かりやすくしました。",
    items: [
      "「Xで投稿」を「Twitterに投稿」に変更",
      "共有テキストと URL コピーの操作性を改善",
    ],
  },
  {
    id: "alpha-0.3.17",
    date: "2026-07-04",
    title: "記録時に公開設定を選べるようになりました",
    body: "新規記録の保存時に、公開範囲をその場で選べます。",
    items: [
      "記録フォームに公開範囲セレクタを追加",
      "非公開・限定公開・公開を記録ごとに設定可能",
    ],
    link: { href: "/records/new", label: "記録する" },
  },
  {
    id: "alpha-0.3.16",
    date: "2026-07-04",
    title: "カード表示を見やすくしました",
    body: "タイムラインと公開プロフィールの記録カードを整理しました。",
    items: [
      "場所・カテゴリ・種類・蔵元などの情報を区別して表示",
      "公開プロフィール上のカード表示も同様に改善",
    ],
  },
  {
    id: "alpha-0.3.15",
    date: "2026-07-04",
    title: "同日の記録をまとめて表示するようにしました",
    body: "同じ日付の記録がグループ化され、振り返りやすくなりました。",
    items: ["タイムラインで日付ごとに記録をグループ表示"],
  },
];

export function getLatestAnnouncement(): Announcement | null {
  return announcements[0] ?? null;
}

export function formatAnnouncementDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}
