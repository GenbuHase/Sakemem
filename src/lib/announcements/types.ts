export type AnnouncementLink = {
  href: string;
  label: string;
};

export type Announcement = {
  id: string;
  date: string;
  title: string;
  body: string;
  items?: string[];
  link?: AnnouncementLink;
};
