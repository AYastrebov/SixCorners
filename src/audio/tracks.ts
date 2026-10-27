/**
 * Music from the 2011 game. All tracks are CC BY-NC-ND: keep the files
 * unedited, credit them (About screen, README) and never use them commercially.
 */
export interface Track {
  readonly file: string;
  readonly title: string;
  readonly artist: string;
  readonly release: string;
  readonly source: string;
  readonly license: string;
  readonly licenseUrl: string;
}

export const MENU_TRACK: Track = {
  file: 'music/goof.mp3',
  title: 'Goof',
  artist: 'Binärpilot',
  release: 'Defrag (2005)',
  source: 'https://binaerpilot.bandcamp.com/album/defrag',
  license: 'CC BY-NC-ND 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
};

const EIGHT_BP050 = {
  release: '8BP050 (8bitpeoples, 2006)',
  source: 'https://www.8bitpeoples.com/products/520638-v-a-8bp050-2cd',
  license: 'CC BY-NC-ND 3.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/3.0/',
};

export const GAME_TRACKS: readonly Track[] = [
  {
    file: 'music/foreigners-journey.mp3',
    title: "Foreigner's Journey",
    artist: 'Twilight Electric',
    ...EIGHT_BP050,
  },
  {
    file: 'music/tribute-to-kyohei-sada.mp3',
    title: 'A Tribute to Kyohei Sada (2006 edition)',
    artist: 'Hally',
    ...EIGHT_BP050,
  },
  { file: 'music/downstairs.mp3', title: 'Downstairs', artist: 'random', ...EIGHT_BP050 },
];

export const ALL_TRACKS: readonly Track[] = [MENU_TRACK, ...GAME_TRACKS];
