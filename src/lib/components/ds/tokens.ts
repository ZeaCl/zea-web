export type ZeaTheme = 'sport' | 'industrial' | 'funds';

export interface ZeaThemeConfig {
  name: ZeaTheme;
  accent: string;
  accentMuted: string;
  accentBorder: string;
  glow: string;
  cardBgGradient: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  btnPrimaryHover: string;
  ringColors: [string, string, string];
  pillActiveBg: string;
  pillActiveText: string;
}

export const ZEA_THEMES: Record<ZeaTheme, ZeaThemeConfig> = {
  sport: {
    name: 'sport',
    accent: '#FA7343',
    accentMuted: 'rgba(250, 115, 67, 0.15)',
    accentBorder: 'rgba(250, 115, 67, 0.35)',
    glow: 'rgba(250, 115, 67, 0.22)',
    cardBgGradient: 'from-[#2B1810] via-[#141010] to-[#0A0A0C]',
    btnPrimaryBg: '#FFFFFF',
    btnPrimaryText: '#000000',
    btnPrimaryHover: 'hover:bg-zinc-200',
    ringColors: ['#FA7343', '#A78BFA', '#5EEAD4'],
    pillActiveBg: '#FA7343',
    pillActiveText: '#000000'
  },
  industrial: {
    name: 'industrial',
    accent: '#FFCD00', // Caterpillar Iconic Yellow
    accentMuted: 'rgba(255, 205, 0, 0.15)',
    accentBorder: 'rgba(255, 205, 0, 0.40)',
    glow: 'rgba(255, 205, 0, 0.24)',
    cardBgGradient: 'from-[#282108] via-[#141412] to-[#0A0A0C]',
    btnPrimaryBg: '#FFCD00',
    btnPrimaryText: '#000000',
    btnPrimaryHover: 'hover:bg-[#FFD733]',
    ringColors: ['#FFCD00', '#F59E0B', '#38BDF8'],
    pillActiveBg: '#FFCD00',
    pillActiveText: '#000000'
  },
  funds: {
    name: 'funds',
    accent: '#10B981', // Wealth / Emerald
    accentMuted: 'rgba(16, 185, 129, 0.15)',
    accentBorder: 'rgba(16, 185, 129, 0.35)',
    glow: 'rgba(16, 185, 129, 0.22)',
    cardBgGradient: 'from-[#0F241C] via-[#0E1513] to-[#0A0A0C]',
    btnPrimaryBg: '#10B981',
    btnPrimaryText: '#FFFFFF',
    btnPrimaryHover: 'hover:bg-emerald-400',
    ringColors: ['#10B981', '#6366F1', '#E2E8F0'],
    pillActiveBg: '#10B981',
    pillActiveText: '#FFFFFF'
  }
};
