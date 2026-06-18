export type HouseholdArea = 'finances' | 'cleaning' | 'organization' | 'pantry';

export const HOUSEHOLD_AREAS: HouseholdArea[] = [
  'finances',
  'cleaning',
  'organization',
  'pantry',
];

export const AREA_LABELS: Record<HouseholdArea, string> = {
  finances: 'Finanzen & Einkäufe',
  cleaning: 'Putzplan',
  organization: 'Organisation',
  pantry: 'Vorrat',
};

export const AREA_TAB_TITLES: Record<HouseholdArea, string> = {
  finances: 'Finanzen',
  cleaning: 'Putzplan',
  organization: 'Organisation',
  pantry: 'Vorrat',
};
