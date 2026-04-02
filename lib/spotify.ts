import { SpotifyHistoryItem, StatsData } from './types';
import { format } from 'date-fns';

export function processSpotifyData(data: SpotifyHistoryItem[]): StatsData {
  // Sort data chronologically to accurately track "first time" discoveries
  const sortedData = [...data].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  let totalMsPlayed: number = 0;
  
  const artistMap: Record<string, { msPlayed: number; count: number }> = {};
  const trackMap: Record<string, { name: string; artist: string; msPlayed: number; count: number; uri: string | null }> = {};
  const monthMap: Record<string, number> = {};
  const platformMap: Record<string, number> = {};

  const timeOfDayMap: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
  const skipMap: Record<string, { name: string; artist: string; plays: number; skips: number; uri: string | null }> = {};
  
  const uniqueArtists = new Set<string>();
  const uniqueTracks = new Set<string>();
  let totalPlays = 0;
  const discoveryMap: Record<string, string[]> = {};

  sortedData.forEach((item) => {
    const isPodcast = item.episode_name !== null || item.audiobook_title !== null;
    const isSong = item.master_metadata_track_name !== null && item.master_metadata_album_artist_name !== null;
    
    totalMsPlayed += item.ms_played;

    if (isSong && !isPodcast) {
      const artist = item.master_metadata_album_artist_name!;
      const track = item.master_metadata_track_name!;
      const trackKey = `${artist} - ${track}`;

      uniqueTracks.add(trackKey);

      // Discovery tracking (First time we see this artist!)
      if (!uniqueArtists.has(artist)) {
        uniqueArtists.add(artist);
        try {
          if (item.ts) {
            const date = new Date(item.ts);
            const monthKey = format(date, 'yyyy-MM');
            if (!discoveryMap[monthKey]) discoveryMap[monthKey] = [];
            discoveryMap[monthKey].push(artist);
          }
        } catch(e) { }
      }

      // Skip metrics
      if (!skipMap[trackKey]) {
        skipMap[trackKey] = { name: track, artist: artist, plays: 0, skips: 0, uri: item.spotify_track_uri };
      }
      skipMap[trackKey].plays += 1;
      if (item.skipped || item.ms_played < 10000) {
        skipMap[trackKey].skips += 1;
      }

      // Aggregate Artist
      if (!artistMap[artist]) {
        artistMap[artist] = { msPlayed: 0, count: 0 };
      }
      
      // Aggregate Track
      if (!trackMap[trackKey]) {
        trackMap[trackKey] = { name: track, artist: artist, msPlayed: 0, count: 0, uri: item.spotify_track_uri };
      }

      const isSkipped = item.skipped || item.ms_played < 30000;

      // Meaningful play
      if (!isSkipped) {
        artistMap[artist].msPlayed += item.ms_played;
        artistMap[artist].count += 1;

        trackMap[trackKey].msPlayed += item.ms_played;
        trackMap[trackKey].count += 1;
        
        totalPlays += 1;
      }
    }

    try {
      if (item.ts) {
        const date = new Date(item.ts);
        const monthKey = format(date, 'yyyy-MM');
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = 0;
        }
        monthMap[monthKey] += item.ms_played;

        const hour = date.getHours();
        let period = "Night";
        if (hour >= 6 && hour < 12) period = "Morning";
        else if (hour >= 12 && hour < 17) period = "Afternoon";
        else if (hour >= 17 && hour < 22) period = "Evening";
        
        timeOfDayMap[period] += item.ms_played;
      }
    } catch(e) { /* ignore invalid dates */ }

    // Platform usage
    let platform = item.platform || "Unknown";
    if (platform.toLowerCase().includes('windows')) platform = 'Windows';
    else if (platform.toLowerCase().includes('ios') || platform.toLowerCase().includes('iphone')) platform = 'iOS';
    else if (platform.toLowerCase().includes('android')) platform = 'Android';
    else if (platform.toLowerCase().includes('mac')) platform = 'Mac';
    else if (platform.toLowerCase().includes('web')) platform = 'Web';
    
    if (!platformMap[platform]) {
      platformMap[platform] = 0;
    }
    platformMap[platform] += item.ms_played;
  });

  const allArtistsMapped = Object.entries(artistMap).map(([name, stats]) => ({ name, ...stats }));
  const topArtistsByTime = [...allArtistsMapped].sort((a, b) => b.msPlayed - a.msPlayed).slice(0, 100);
  const topArtistsByPlays = [...allArtistsMapped].sort((a, b) => b.count - a.count).slice(0, 100);

  const allTracksArr = Object.values(trackMap);
  const topTracksByTime = [...allTracksArr].sort((a, b) => b.msPlayed - a.msPlayed).slice(0, 100);
  const topTracksByPlays = [...allTracksArr].sort((a, b) => b.count - a.count).slice(0, 100);

  const historyByMonth = Object.entries(monthMap)
    .map(([month, msPlayed]) => ({ month, msPlayed }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const platformUsage = Object.entries(platformMap)
    .map(([platform, msPlayed]) => ({ platform, msPlayed }))
    .sort((a, b) => b.msPlayed - a.msPlayed);

  const timeOfDay = [
    { period: "Morning (6-12)", msPlayed: timeOfDayMap["Morning"] },
    { period: "Afternoon (12-17)", msPlayed: timeOfDayMap["Afternoon"] },
    { period: "Evening (17-22)", msPlayed: timeOfDayMap["Evening"] },
    { period: "Night (22-6)", msPlayed: timeOfDayMap["Night"] }
  ];

  const skippedTracks = Object.values(skipMap)
    .filter(t => t.plays >= 10)
    .map(t => ({
      ...t,
      skipRatio: t.skips / t.plays,
      totalPlays: t.plays
    }))
    .sort((a, b) => b.skipRatio - a.skipRatio || b.totalPlays - a.totalPlays)
    .slice(0, 50);

  const discoveryByMonth = Object.entries(discoveryMap)
    .map(([month, artists]) => ({ 
      month, 
      newArtists: artists.length, 
      artists: artists.sort((a, b) => a.localeCompare(b)) 
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const uniqueArtistsCount = uniqueArtists.size;
  // Obscure / One-hit wonders: Discovered artists that had exactly 1 meaningful play (unskipped > 30s)
  const allArtists = Object.entries(artistMap)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.msPlayed - a.msPlayed);

  const oneHitWonders = allArtists.filter(a => a.count === 1).map(a => ({ name: a.name }));
  const oneHitWondersCount = oneHitWonders.length;

  return {
    totalMsPlayed,
    totalHoursPlayed: Math.round(totalMsPlayed / (1000 * 60 * 60)),
    totalPlays,
    topArtistsByTime,
    topArtistsByPlays,
    topTracksByTime,
    topTracksByPlays,
    historyByMonth,
    platformUsage,
    timeOfDay,
    skippedTracks,
    discoveryByMonth,
    uniqueArtistsCount,
    uniqueTracksCount: uniqueTracks.size,
    oneHitWondersCount,
    allArtists,
    oneHitWonders
  };
}
