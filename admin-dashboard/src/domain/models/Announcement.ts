import type { IsoDateString, PaginationParams } from './common';

export type AnnouncementTarget = 'ALL' | 'PRO_ONLY' | 'FREE_ONLY';
export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AnnouncementLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  target: AnnouncementTarget;
  date: IsoDateString;
  active: boolean;
  status: AnnouncementStatus;
  level: AnnouncementLevel;
  linkUrl?: string;
  dismissible: boolean;
  startsAt?: IsoDateString;
  endsAt?: IsoDateString;
  publishedAt?: IsoDateString;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
}

export interface AnnouncementListParams extends PaginationParams {
  active?: boolean;
  target?: AnnouncementTarget;
}

export type AnnouncementCreate = Pick<Announcement,
  'title' | 'body' | 'target'
> & Partial<Pick<Announcement, 'status' | 'level' | 'linkUrl' | 'dismissible' | 'startsAt' | 'endsAt'>>;
export type AnnouncementUpdate = Partial<Pick<Announcement,
  'title' | 'body' | 'target' | 'active' | 'status' | 'level' | 'linkUrl' | 'dismissible' | 'startsAt' | 'endsAt'
>>;
