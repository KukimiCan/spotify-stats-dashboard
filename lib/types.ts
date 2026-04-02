export interface SpotifyHistoryItem {
  ts: string; // "2022-12-05T10:13:58Z"
  platform: string;
  ms_played: number;
  conn_country: string;
  ip_addr: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;
  audiobook_title: string | null;
  audiobook_uri: string | null;
  audiobook_chapter_uri: string | null;
  audiobook_chapter_title: string | null;
  reason_start: string;
  reason_end: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  offline_timestamp: number | null;
  incognito_mode: boolean;
}

export interface StatsData {
  totalMsPlayed: number;
  totalHoursPlayed: number;
  totalPlays: number;
  topArtistsByTime: Array<{ name: string; msPlayed: number; count: number }>;
  topArtistsByPlays: Array<{ name: string; msPlayed: number; count: number }>;
  topTracksByTime: Array<{ name: string; artist: string; msPlayed: number; count: number; uri: string | null }>;
  topTracksByPlays: Array<{ name: string; artist: string; msPlayed: number; count: number; uri: string | null }>;
  historyByMonth: Array<{ month: string; msPlayed: number }>;
  platformUsage: Array<{ platform: string; msPlayed: number }>;
  timeOfDay: Array<{ period: string; msPlayed: number }>;
  skippedTracks: Array<{ name: string; artist: string; skipRatio: number; totalPlays: number; skips: number; uri: string | null }>;
  discoveryByMonth: Array<{ month: string; newArtists: number; artists: string[] }>;
  uniqueArtistsCount: number;
  uniqueTracksCount: number;
  oneHitWondersCount: number;
  allArtists: Array<{ name: string; msPlayed: number; count: number }>;
  oneHitWonders: Array<{ name: string }>;
}
