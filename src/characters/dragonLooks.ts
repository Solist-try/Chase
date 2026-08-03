export type DragonColorId =
  | 'emerald'
  | 'sky'
  | 'sunset'
  | 'berry'
  | 'lemon'
  | 'grape'
  | 'cotton'
  | 'rainbow';

export type DragonAccessoryId =
  | 'none'
  | 'party_hat'
  | 'wizard_hat'
  | 'crown'
  | 'bow'
  | 'scarf'
  | 'glasses'
  | 'flower';

export interface DragonColorPreset {
  id: DragonColorId;
  label: string;
  body: string;
  belly: string;
  crest: string;
  wing: string;
  accent: string;
}

export interface DragonAccessory {
  id: DragonAccessoryId;
  label: string;
  emoji: string;
}

export interface DragonLook {
  name: string;
  colorId: DragonColorId;
  accessoryId: DragonAccessoryId;
}

export const MAX_DRAGON_NAME_LENGTH = 12;

export const DRAGON_COLOR_PRESETS: readonly DragonColorPreset[] = [
  {
    id: 'emerald',
    label: 'Emerald',
    body: '#2ec4b6',
    belly: '#cbf3f0',
    crest: '#ff9f1c',
    wing: '#9bf6ff',
    accent: '#1b9aaa',
  },
  {
    id: 'sky',
    label: 'Sky',
    body: '#00bbf9',
    belly: '#e0f7ff',
    crest: '#fee440',
    wing: '#90e0ef',
    accent: '#0077b6',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    body: '#ff6b35',
    belly: '#ffe5d9',
    crest: '#ffd166',
    wing: '#ffadad',
    accent: '#c1121f',
  },
  {
    id: 'berry',
    label: 'Berry',
    body: '#ff4d6d',
    belly: '#ffd6e0',
    crest: '#ffd166',
    wing: '#ff8fa3',
    accent: '#c9184a',
  },
  {
    id: 'lemon',
    label: 'Lemon',
    body: '#ffd60a',
    belly: '#fff3b0',
    crest: '#ff6b35',
    wing: '#ffe566',
    accent: '#e09f3e',
  },
  {
    id: 'grape',
    label: 'Grape',
    body: '#9b5de5',
    belly: '#e0cffc',
    crest: '#f15bb5',
    wing: '#c77dff',
    accent: '#5a189a',
  },
  {
    id: 'cotton',
    label: 'Cotton',
    body: '#ff99c8',
    belly: '#fff0f6',
    crest: '#80ed99',
    wing: '#fcf6bd',
    accent: '#ff5d8f',
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    body: '#00f5d4',
    belly: '#fffaf0',
    crest: '#f15bb5',
    wing: '#fee440',
    accent: '#9b5de5',
  },
] as const;

export const DRAGON_ACCESSORIES: readonly DragonAccessory[] = [
  { id: 'none', label: 'None', emoji: '✨' },
  { id: 'party_hat', label: 'Party Hat', emoji: '🎉' },
  { id: 'wizard_hat', label: 'Wizard Hat', emoji: '🪄' },
  { id: 'crown', label: 'Crown', emoji: '👑' },
  { id: 'bow', label: 'Bow', emoji: '🎀' },
  { id: 'scarf', label: 'Scarf', emoji: '🧣' },
  { id: 'glasses', label: 'Glasses', emoji: '👓' },
  { id: 'flower', label: 'Flower', emoji: '🌸' },
] as const;

export const DEFAULT_DRAGON_LOOK: DragonLook = {
  name: 'Cruul',
  colorId: 'emerald',
  accessoryId: 'none',
};

export function getColorPreset(id: DragonColorId): DragonColorPreset {
  return (
    DRAGON_COLOR_PRESETS.find((preset) => preset.id === id) ??
    DRAGON_COLOR_PRESETS[0]
  );
}

export function sanitizeDragonName(raw: string): string {
  const cleaned = raw.replace(/[^\p{L}\p{N} _'-]/gu, '').slice(0, MAX_DRAGON_NAME_LENGTH);
  return cleaned.trim() || DEFAULT_DRAGON_LOOK.name;
}
