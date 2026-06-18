import { Linking, Platform, Share } from 'react-native';

import { buildInviteUrl, getAppName } from '@/features/integrations/deep-links';
import type { OrgEvent } from '@/features/organization/use-org-events';
import type { ShoppingListItem } from '@/features/finances/use-shopping-list';

type ShareTextOptions = {
  title: string;
  body: string;
  url?: string;
};

export async function shareText({ title, body, url }: ShareTextOptions): Promise<void> {
  const message = url ? `${body}\n\n${url}` : body;
  await Share.share(
    Platform.OS === 'ios' ? { message, url, title } : { message, title },
    { dialogTitle: title },
  );
}

export async function shareViaWhatsApp(text: string): Promise<void> {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error('WhatsApp ist auf diesem Gerät nicht verfügbar');
  }
  await Linking.openURL(url);
}

export function formatShoppingListShare(
  householdName: string,
  items: ShoppingListItem[],
): string {
  const openItems = items.filter((item) => !item.checked);
  const lines = openItems.length
    ? openItems.map((item) => `☐ ${item.name}`)
    : ['(alles erledigt)'];

  return [`🛒 Einkaufsliste ${householdName}`, ...lines, `— via ${getAppName()}`].join('\n');
}

export function formatOrgEventsShare(householdName: string, events: OrgEvent[]): string {
  const upcoming = events.slice(0, 10);
  const lines = upcoming.length
    ? upcoming.map((event) => `• ${formatEventLine(event)}`)
    : ['(keine Termine geplant)'];

  return [`📅 Termine ${householdName}`, ...lines, `— via ${getAppName()}`].join('\n');
}

export function formatInviteShare(householdName: string, token: string): string {
  const url = buildInviteUrl(token);
  return [
    `🏠 Einladung zu ${householdName}`,
    `Tritt unserem Haushalt in ${getAppName()} bei:`,
    url,
  ].join('\n');
}

function formatEventLine(event: OrgEvent): string {
  const date = new Date(event.startsAt).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  return `${date}: ${event.title}`;
}

export async function shareShoppingList(
  householdName: string,
  items: ShoppingListItem[],
  viaWhatsApp = false,
): Promise<void> {
  const body = formatShoppingListShare(householdName, items);
  if (viaWhatsApp) {
    await shareViaWhatsApp(body);
    return;
  }
  await shareText({ title: 'Einkaufsliste teilen', body });
}

export async function shareOrgEvents(
  householdName: string,
  events: OrgEvent[],
  viaWhatsApp = false,
): Promise<void> {
  const body = formatOrgEventsShare(householdName, events);
  if (viaWhatsApp) {
    await shareViaWhatsApp(body);
    return;
  }
  await shareText({ title: 'Termine teilen', body });
}

export async function shareHouseholdInvite(
  householdName: string,
  token: string,
  viaWhatsApp = false,
): Promise<void> {
  const body = formatInviteShare(householdName, token);
  if (viaWhatsApp) {
    await shareViaWhatsApp(body);
    return;
  }
  await shareText({ title: 'Haushalt einladen', body, url: buildInviteUrl(token) });
}
