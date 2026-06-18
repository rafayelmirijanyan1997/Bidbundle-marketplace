import {ScheduleItem} from '../../api/provider';

export interface ScheduleSummary {
  key: string;
  requestId: number | null;
  title: string;
  address: string | null;
  status: string;
  totalMinutes: number;
  dates: string[];
  firstScheduledAt: string;
}

function cleanScheduleTitle(title: string) {
  return title.replace(/^Temporary hold\s+[—-]\s+/i, '').trim();
}

export function groupScheduleItems(items: ScheduleItem[]): ScheduleSummary[] {
  const groups = new Map<string, ScheduleSummary>();

  for (const item of items) {
    const title = cleanScheduleTitle(item.title);
    const key = `${item.request_id ?? 'none'}|${title}|${item.address ?? ''}|${item.status}`;
    const date = item.scheduled_at.slice(0, 10);
    const existing = groups.get(key);

    if (existing) {
      existing.totalMinutes += item.duration_minutes;
      if (!existing.dates.includes(date)) {
        existing.dates.push(date);
      }
      if (new Date(item.scheduled_at) < new Date(existing.firstScheduledAt)) {
        existing.firstScheduledAt = item.scheduled_at;
      }
      continue;
    }

    groups.set(key, {
      key,
      requestId: item.request_id ?? null,
      title,
      address: item.address,
      status: item.status,
      totalMinutes: item.duration_minutes,
      dates: [date],
      firstScheduledAt: item.scheduled_at,
    });
  }

  return Array.from(groups.values())
    .map(group => ({
      ...group,
      dates: group.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    }))
    .sort((a, b) => new Date(a.firstScheduledAt).getTime() - new Date(b.firstScheduledAt).getTime());
}

export function formatScheduleDates(dates: string[]) {
  if (dates.length === 0) {
    return '';
  }
  return dates
    .map(value =>
      new Date(`${value}T12:00:00`).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
    )
    .join(' · ');
}

export function formatScheduleDuration(totalMinutes: number) {
  const hours = totalMinutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours}h`;
  }
  return `${Math.round(hours * 10) / 10}h`;
}
