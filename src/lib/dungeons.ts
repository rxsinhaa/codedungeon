export interface DungeonTheme {
  '--background': string;
  '--foreground': string;
  '--card': string;
  '--card-foreground': string;
  '--popover': string;
  '--popover-foreground': string;
  '--primary': string;
  '--primary-foreground': string;
  '--secondary': string;
  '--secondary-foreground': string;
  '--muted': string;
  '--muted-foreground': string;
  '--accent': string;
  '--accent-foreground': string;
  '--destructive': string;
  '--destructive-foreground': string;
  '--border': string;
  '--input': string;
  '--ring': string;
  // Terminal / Combat Log specific
  '--terminal-bg': string;
  '--terminal-border': string;
  '--terminal-text': string;
  '--terminal-success': string;
  '--terminal-error': string;
  '--terminal-quest': string;
  '--terminal-system': string;
  '--terminal-debug': string;
}

export interface DungeonLevel {
  id: string;
  name: string;
  theme: DungeonTheme;
}

export const dungeons: DungeonLevel[] = [
  {
    id: 'tavern',
    name: 'The Whispering Tavern',
    theme: {
      '--background': '47 72% 89%', // parchment-default
      '--foreground': '29 71% 13%', // wood-900
      '--card': '46 88% 94%', // parchment-light
      '--card-foreground': '29 71% 13%',
      '--popover': '46 88% 94%',
      '--popover-foreground': '29 71% 13%',
      '--primary': '28 56% 41%', // wood-500
      '--primary-foreground': '46 88% 94%',
      '--secondary': '29 61% 53%', // wood-300
      '--secondary-foreground': '29 71% 13%',
      '--muted': '46 45% 77%', // parchment-dark
      '--muted-foreground': '29 67% 27%', // wood-700
      '--accent': '217 91% 60%', // magic-default
      '--accent-foreground': '46 88% 94%',
      '--destructive': '0 84% 60%', // hp-red
      '--destructive-foreground': '46 88% 94%',
      '--border': '29 61% 53%', // wood-300
      '--input': '29 70% 71%', // wood-100
      '--ring': '217 91% 60%',
      // Dark Terminal (Original)
      '--terminal-bg': '24 5% 6%', // stone-900 approx
      '--terminal-border': '24 5% 33%', // stone-600
      '--terminal-text': '24 5% 83%', // stone-300
      '--terminal-success': '142 70% 70%', // green-300
      '--terminal-error': '0 93% 80%', // red-300
      '--terminal-quest': '50 98% 65%', // yellow-300
      '--terminal-system': '217 91% 75%', // blue-300
      '--terminal-debug': '24 5% 64%', // stone-400
    },
  },
  {
    id: 'armory',
    name: 'The Arcane Armory',
    theme: {
      '--background': '210 40% 96%', // slate-100 (Light)
      '--foreground': '222 47% 11%', // slate-900 (Dark/Black)
      '--card': '0 0% 100%', // white
      '--card-foreground': '222 47% 11%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222 47% 11%',
      '--primary': '262 84% 60%', // violet-600
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 90%', // slate-200
      '--secondary-foreground': '222 47% 11%',
      '--muted': '210 40% 90%',
      '--muted-foreground': '215 16% 47%',
      '--accent': '330 84% 60%', // fuchsia-500
      '--accent-foreground': '222 47% 11%',
      '--destructive': '0 72% 51%', // red-600
      '--destructive-foreground': '210 40% 98%',
      '--border': '215 16% 47%', // slate-500
      '--input': '215 16% 47%',
      '--ring': '262 84% 60%',
      // Light Terminal
      '--terminal-bg': '0 0% 100%', // white
      '--terminal-border': '215 16% 47%', // slate-500
      '--terminal-text': '222 47% 11%', // black/dark slate
      '--terminal-success': '142 76% 36%', // green-600
      '--terminal-error': '0 72% 51%', // red-600
      '--terminal-quest': '330 84% 40%', // fuchsia-700
      '--terminal-system': '262 84% 50%', // violet-600
      '--terminal-debug': '215 16% 47%', // slate-500
    },
  },
  {
    id: 'library',
    name: 'The Forbidden Library',
    theme: {
      '--background': '45 100% 96%', // amber-50 (Light)
      '--foreground': '20 14% 4%', // neutral-900 (Black)
      '--card': '45 100% 93%',
      '--card-foreground': '20 14% 4%',
      '--popover': '45 100% 96%',
      '--popover-foreground': '20 14% 4%',
      '--primary': '158 84% 40%', // emerald-600
      '--primary-foreground': '0 0% 100%',
      '--secondary': '45 50% 90%',
      '--secondary-foreground': '20 14% 4%',
      '--muted': '45 30% 90%',
      '--muted-foreground': '20 10% 40%',
      '--accent': '25 95% 53%', // orange-500
      '--accent-foreground': '0 0% 100%',
      '--destructive': '0 84% 60%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '158 84% 40%',
      '--input': '20 14% 20%',
      '--ring': '25 95% 53%',
      // Light Terminal
      '--terminal-bg': '45 100% 98%',
      '--terminal-border': '158 84% 40%',
      '--terminal-text': '20 14% 4%',
      '--terminal-success': '158 84% 35%', // emerald-700
      '--terminal-error': '0 84% 45%', // red-700
      '--terminal-quest': '25 95% 45%', // orange-600
      '--terminal-system': '158 84% 40%', // emerald-600
      '--terminal-debug': '20 10% 40%',
    },
  },
  {
    id: 'citadel',
    name: 'The Shadow Citadel',
    theme: {
      '--background': '240 5% 96%', // zinc-100 (Light)
      '--foreground': '240 10% 4%', // zinc-950 (Black)
      '--card': '0 0% 100%',
      '--card-foreground': '240 10% 4%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 10% 4%',
      '--primary': '263 70% 50%', // violet-700
      '--primary-foreground': '0 0% 100%',
      '--secondary': '240 5% 90%',
      '--secondary-foreground': '240 10% 4%',
      '--muted': '240 5% 90%',
      '--muted-foreground': '240 4% 46%',
      '--accent': '263 70% 50%',
      '--accent-foreground': '0 0% 100%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '240 4% 46%',
      '--input': '240 4% 46%',
      '--ring': '263 70% 50%',
      // Light Terminal
      '--terminal-bg': '240 5% 98%',
      '--terminal-border': '240 4% 46%',
      '--terminal-text': '240 10% 4%',
      '--terminal-success': '263 70% 40%',
      '--terminal-error': '0 63% 40%',
      '--terminal-quest': '263 70% 50%',
      '--terminal-system': '240 10% 40%',
      '--terminal-debug': '240 4% 60%',
    },
  },
  {
    id: 'inferno',
    name: 'The Infernal Core',
    theme: {
      '--background': '0 85% 97%', // red-50 (Light)
      '--foreground': '0 72% 5%', // red-950/black
      '--card': '0 0% 100%',
      '--card-foreground': '0 72% 5%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 72% 5%',
      '--primary': '0 72% 51%', // red-600
      '--primary-foreground': '0 0% 100%',
      '--secondary': '0 85% 90%',
      '--secondary-foreground': '0 72% 5%',
      '--muted': '0 85% 90%',
      '--muted-foreground': '0 50% 40%',
      '--accent': '25 95% 50%', // orange-500
      '--accent-foreground': '0 72% 5%',
      '--destructive': '0 84% 60%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '0 72% 51%',
      '--input': '0 40% 80%',
      '--ring': '0 72% 51%',
      // Light Terminal
      '--terminal-bg': '0 85% 99%',
      '--terminal-border': '0 72% 51%',
      '--terminal-text': '0 72% 5%',
      '--terminal-success': '142 70% 30%',
      '--terminal-error': '0 84% 40%',
      '--terminal-quest': '25 95% 45%',
      '--terminal-system': '0 72% 51%',
      '--terminal-debug': '0 50% 50%',
    },
  },
];
