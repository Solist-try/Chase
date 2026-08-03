/** Rainbow-bright level themes for a cheerful kids adventure. */

export type RainbowThemeId =
  | 'ruby'
  | 'sunset'
  | 'lemon'
  | 'lime'
  | 'sky'
  | 'grape'
  | 'cotton';

export interface RainbowTheme {
  id: RainbowThemeId;
  label: string;
  /** Top-of-sky fill */
  background: string;
  /** Soft lower wash (drawn as hills / gradient hint) */
  backgroundBottom: string;
  ground: string;
  platform: string;
  accent: string;
  cloud: string;
}

export const RAINBOW_THEMES: Record<RainbowThemeId, RainbowTheme> = {
  ruby: {
    id: 'ruby',
    label: 'Ruby Dawn',
    background: '#FF8FAB',
    backgroundBottom: '#FFB3C6',
    ground: '#F72585',
    platform: '#FF4D6D',
    accent: '#FFE566',
    cloud: '#FFF0F5',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset Trail',
    background: '#FF9F1C',
    backgroundBottom: '#FFBF69',
    ground: '#E85D04',
    platform: '#F48C06',
    accent: '#FFD166',
    cloud: '#FFF3E0',
  },
  lemon: {
    id: 'lemon',
    label: 'Lemon Grove',
    background: '#FFE566',
    backgroundBottom: '#FFF3A3',
    ground: '#F4D35E',
    platform: '#FFD166',
    accent: '#80ED99',
    cloud: '#FFFEF2',
  },
  lime: {
    id: 'lime',
    label: 'Lime Meadow',
    background: '#80ED99',
    backgroundBottom: '#B7F7C5',
    ground: '#2D6A4F',
    platform: '#52B788',
    accent: '#FFD166',
    cloud: '#F0FFF4',
  },
  sky: {
    id: 'sky',
    label: 'Sky Parade',
    background: '#00BBF9',
    backgroundBottom: '#90E0EF',
    ground: '#0077B6',
    platform: '#48CAE4',
    accent: '#FFD166',
    cloud: '#F0FBFF',
  },
  grape: {
    id: 'grape',
    label: 'Grape Garden',
    background: '#B5179E',
    backgroundBottom: '#E0AAFF',
    ground: '#7B2CBF',
    platform: '#C77DFF',
    accent: '#FFD166',
    cloud: '#F8F0FF',
  },
  cotton: {
    id: 'cotton',
    label: 'Cotton Candy',
    background: '#FF85A1',
    backgroundBottom: '#A0C4FF',
    ground: '#FF66C4',
    platform: '#9BF6FF',
    accent: '#FFFF66',
    cloud: '#FFFFFF',
  },
};

export function getTheme(id: RainbowThemeId): RainbowTheme {
  return RAINBOW_THEMES[id];
}
