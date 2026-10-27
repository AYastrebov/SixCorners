import { GAME_TRACKS, MENU_TRACK, type Track } from './tracks';

type Playlist = 'menu' | 'game';

/**
 * Background music. Tracks are fetched whole (so the service worker can cache
 * them for offline play) and played through one <audio> element. Browsers only
 * allow sound after a user gesture, so a blocked start is retried on the next
 * tap or key press.
 */
class MusicPlayer {
  private readonly audio = new Audio();
  private playlist: Playlist | null = null;
  private track: Track | null = null;
  private objectUrl: string | null = null;
  private volume = 0.6;
  private held = false;
  private blocked = false;

  constructor() {
    this.audio.addEventListener('ended', () => {
      if (this.playlist === 'game') void this.load(this.nextGameTrack());
    });
    const retry = () => {
      if (this.blocked) void this.start();
    };
    window.addEventListener('pointerdown', retry);
    window.addEventListener('keydown', retry);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.audio.pause();
      else if (!this.held) void this.start();
    });
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.audio.volume = volume;
    if (volume === 0) this.audio.pause();
    else if (!this.held) void this.start();
  }

  play(playlist: Playlist) {
    this.held = false;
    if (this.playlist === playlist) {
      void this.start();
      return;
    }
    this.playlist = playlist;
    void this.load(playlist === 'menu' ? MENU_TRACK : this.nextGameTrack());
  }

  /** Pauses until `resume` or `play` (game paused, game over). */
  hold() {
    this.held = true;
    this.audio.pause();
  }

  resume() {
    this.held = false;
    void this.start();
  }

  private nextGameTrack(): Track {
    const others = GAME_TRACKS.filter((t) => t !== this.track);
    return others[Math.floor(Math.random() * others.length)] ?? MENU_TRACK;
  }

  private async load(track: Track) {
    this.track = track;
    this.audio.loop = this.playlist === 'menu';
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${track.file}`);
      const blob = await response.blob();
      if (this.track !== track) return; // a newer request won
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = URL.createObjectURL(blob);
      this.audio.src = this.objectUrl;
      await this.start();
    } catch {
      // Offline before the track was ever cached: play on without music.
    }
  }

  private async start() {
    if (this.volume === 0 || this.held || !this.audio.src || document.hidden) return;
    this.audio.volume = this.volume;
    try {
      await this.audio.play();
      this.blocked = false;
    } catch {
      this.blocked = true;
    }
  }
}

export const music = new MusicPlayer();
