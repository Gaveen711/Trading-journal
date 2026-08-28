import type {
  Announcement,
  AnnouncementCreate,
  AnnouncementListParams,
  AnnouncementUpdate,
  Paginated,
} from '../../domain/models';
import { decodeAnnouncement, reasonedBody, requestCollection, requestData } from '../api';

function announcementPayload(value: AnnouncementCreate | AnnouncementUpdate): Record<string, unknown> {
  const { target, active, status, level, ...rest } = value as AnnouncementUpdate;
  return {
    ...rest,
    ...(target ? { audience: target === 'ALL' ? 'all' : target === 'FREE_ONLY' ? 'free' : 'pro' } : {}),
    ...(status ? { status: status.toLowerCase() } : active !== undefined ? { status: active ? 'published' : 'archived' } : {}),
    ...(level ? { level: level.toLowerCase() } : {}),
  };
}

export const AnnouncementRepository = {
  list(params: AnnouncementListParams = {}, signal?: AbortSignal): Promise<Paginated<Announcement>> {
    return requestCollection('/announcements', decodeAnnouncement, { ...params }, signal);
  },

  create(value: AnnouncementCreate, reason: string, signal?: AbortSignal): Promise<Announcement> {
    return requestData('/announcements', decodeAnnouncement, {
      method: 'POST',
      body: reasonedBody(announcementPayload(value), reason),
      signal,
    });
  },

  update(
    announcementId: string,
    updates: AnnouncementUpdate,
    reason: string,
    signal?: AbortSignal,
  ): Promise<Announcement> {
    return requestData(`/announcements/${encodeURIComponent(announcementId)}`, decodeAnnouncement, {
      method: 'PATCH',
      body: reasonedBody(announcementPayload(updates), reason),
      signal,
    });
  },

  async delete(announcementId: string, reason: string, signal?: AbortSignal): Promise<void> {
    await requestData(`/announcements/${encodeURIComponent(announcementId)}`, () => undefined, {
      method: 'DELETE',
      body: reasonedBody({}, reason),
      signal,
    });
  },
};
