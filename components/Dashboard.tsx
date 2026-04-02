"use client";

import { useState, useEffect } from "react";
import { SpotifyHistoryItem, StatsData } from "@/lib/types";
import { processSpotifyData } from "@/lib/spotify";
import { set, get, clear } from "idb-keyval";
import { FileUpload } from "./FileUpload";
import { StatCard } from "./StatCard";
import { TopList } from "./TopList";
import { HistoryChart } from "./HistoryChart";
import { DiscoveryChart } from "./DiscoveryChart";
import { ArtistPieChart } from "./ArtistPieChart";
import { SkippedTracksList } from "./SkippedTracksList";
import { Modal } from "./Modal";
import { Clock, Music, Mic2, PlayCircle, Loader2, Disc, Ghost, Compass, Calendar, ChevronDown, Info, Download } from "lucide-react";
import { toPng } from "html-to-image";

export function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<'artists' | 'oneHitWonders' | null>(null);
  const [showDiscoveryLog, setShowDiscoveryLog] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [totalListeningMode, setTotalListeningMode] = useState<'time' | 'plays'>('time');
  const [uniqueStatsMode, setUniqueStatsMode] = useState<'artists' | 'tracks'>('artists');

  const handleDownloadImage = async () => {
    const element = document.getElementById("dashboard-capture");
    if (!element) return;
    try {
      setIsExporting(true);
      // Brief timeout to ensure any state updates flush before capture
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await toPng(element, { 
        backgroundColor: "#0a0a0a",
        pixelRatio: 2,
        skipFonts: true, // Bypasses the bug where SVG/Recharts nodes crash font embedding
        filter: (node: HTMLElement) => {
          // exclude buttons
          if (node.getAttribute && node.getAttribute('data-html2canvas-ignore') === 'true') {
            return false;
          }
          return true;
        }
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `spotify-stats-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-load saved data from IndexedDB on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await get<SpotifyHistoryItem[]>('spotify_history_data');
        if (savedData && savedData.length > 0) {
          handleDataLoaded(savedData, false);
        }
      } catch (err) {
        console.error("Failed to load saved data from IndexedDB", err);
      }
    };
    loadSavedData();
  }, []);

  const handleDataLoaded = async (data: SpotifyHistoryItem[], shouldSave = true) => {
    setIsProcessing(true);

    if (shouldSave) {
      try {
        // Save raw imported data to IndexedDB for persistent reload
        await set('spotify_history_data', data);
      } catch (err) {
        console.error("Failed to save data to IndexedDB", err);
      }
    }

    setTimeout(() => {
      const processed = processSpotifyData(data);
      setStats(processed);
      setIsProcessing(false);
    }, 100);
  };

  if (isProcessing) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
        <p className="text-lg">Crunching your music data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Spotify Data Visualizer</h1>
          <p className="text-zinc-400 text-lg">
            Upload your Spotify Extended Streaming History (JSON) to generate your true listening stats.
          </p>
        </div>
        <FileUpload onDataLoaded={handleDataLoaded} />
        
        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg text-left animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-green-500" />
            自分のSpotifyデータを取得するには？
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-zinc-400 text-sm leading-relaxed">
            <li>ブラウザから<strong>Spotifyのアカウントページ</strong>にログインします。</li>
            <li>メニューから<strong>「プライバシー設定 (Privacy settings)」</strong>を開きます。</li>
            <li>ページ下部の<strong>「データのダウンロード」</strong>セクションへ移動します。</li>
            <li><strong>「拡張ストリーミング履歴 (Extended streaming history)」</strong>にチェックを入れます。<br/><span className="text-zinc-500 ml-5">※重要：過去1年分だけでなく、Spotify利用開始からの全履歴が含まれるこちらを選択してください！</span></li>
            <li>リクエストを送信すると、準備ができ次第SpotifyからZIPファイルがメールで届きます（数日かかる場合があります）。</li>
            <li>ZIPを解凍し、中に入っている <code>StreamingHistory_audio_*.json</code> などのファイルを上の点線枠にドロップしてください！</li>
          </ol>
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-xs text-zinc-500">
            <strong>プライバシーに関する安全性:</strong> このアプリは完全にブラウザ上（あなたの端末内）でのみ動作する仕組みになっています。アップロードした履歴データが外部のサーバーに送信されたり、データベースに保存されることは<strong>一切ありません</strong>。安心してご利用ください。
          </div>
        </div>
      </div>
    );
  }

  const formatHours = (ms: number) => Math.round(ms / (1000 * 60 * 60)).toLocaleString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative bg-[#0a0a0a] p-6 md:p-10 rounded-3xl border border-zinc-900 shadow-2xl" id="dashboard-capture">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Your Listening Dashboard</h1>
          <p className="text-zinc-400 text-sm">
            Based on {stats.totalHoursPlayed.toLocaleString()} total hours of listening
          </p>
        </div>
        <div className="flex items-center gap-3" data-html2canvas-ignore="true">
          <button 
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="text-sm bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-wait text-black font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Saving..." : "Save as Image"}
          </button>
          <button 
            onClick={async () => {
              try {
                await clear(); // Wipe IndexedDB
              } catch (e) { console.error("Failed to clear IndexedDB", e); }
              setStats(null);
            }}
            className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-full transition-colors flex items-center gap-2"
          >
            Start Over
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Top: Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Listening"
            value={totalListeningMode === 'time' ? `${stats.totalHoursPlayed.toLocaleString()}h` : stats.totalPlays.toLocaleString()}
            icon={<Clock className="w-5 h-5" />}
            description={totalListeningMode === 'time' ? "All time total including podcasts" : "Total tracks played"}
            headerAction={
              <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 shadow-inner w-fit">
                <button 
                  onClick={(e) => { e.stopPropagation(); setTotalListeningMode('plays'); }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${totalListeningMode === 'plays' ? 'bg-zinc-800 text-green-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Plays
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setTotalListeningMode('time'); }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${totalListeningMode === 'time' ? 'bg-zinc-800 text-purple-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Time
                </button>
              </div>
            }
          />
          <StatCard 
            title="Unique Library" 
            value={uniqueStatsMode === 'artists' ? stats.uniqueArtistsCount.toLocaleString() : stats.uniqueTracksCount.toLocaleString()}
            icon={uniqueStatsMode === 'artists' ? <Disc className="w-5 h-5" /> : <Music className="w-5 h-5" />}
            description={uniqueStatsMode === 'artists' ? "Total unique artists" : "Total unique songs"}
            headerAction={
              <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 shadow-inner w-fit">
                <button 
                  onClick={(e) => { e.stopPropagation(); setUniqueStatsMode('artists'); }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${uniqueStatsMode === 'artists' ? 'bg-zinc-800 text-purple-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Artists
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setUniqueStatsMode('tracks'); }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${uniqueStatsMode === 'tracks' ? 'bg-zinc-800 text-green-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Tracks
                </button>
              </div>
            }
          />
          <StatCard 
            title="One-Hit Wonders" 
            value={stats.oneHitWondersCount.toLocaleString()}
            icon={<Ghost className="w-5 h-5" />}
            description="Click to view ->"
            onClick={() => setActiveModal('oneHitWonders')}
          />
          <StatCard 
            title="Top Artist" 
            value={stats.topArtistsByTime[0]?.name || "N/A"}
            icon={<Mic2 className="w-5 h-5" />}
            description={`${formatHours(stats.topArtistsByTime[0]?.msPlayed || 0)} hours`}
          />
        </div>

        {/* Middle: Main Charts (left) and Side Charts (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
              <HistoryChart data={stats.historyByMonth} />
              <DiscoveryChart 
                data={stats.discoveryByMonth} 
                onViewDetails={() => setShowDiscoveryLog(true)}
              />
            </div>
            {/* Bottom 3 Lists aligned Left */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-auto">
              <TopList 
                title="Top Artists"
                icon={<Mic2 className="w-5 h-5" />}
                defaultSort="time"
                itemsByTime={stats.topArtistsByTime.slice(0, 50).map(a => ({
                  id: a.name,
                  title: a.name,
                  value: `${formatHours(a.msPlayed)}h`,
                  url: `https://open.spotify.com/search/${encodeURIComponent(a.name)}`
                }))}
                itemsByPlays={stats.topArtistsByPlays.slice(0, 50).map(a => ({
                  id: a.name,
                  title: a.name,
                  value: `${a.count} plays`,
                  url: `https://open.spotify.com/search/${encodeURIComponent(a.name)}`
                }))}
              />
              <TopList 
                title="Top Tracks"
                icon={<PlayCircle className="w-5 h-5" />}
                defaultSort="plays"
                itemsByTime={stats.topTracksByTime.slice(0, 50).map(t => {
                  const trackId = t.uri ? t.uri.replace('spotify:track:', '') : '';
                  return {
                    id: `${t.name}-${t.artist}`,
                    title: t.name,
                    subtitle: t.artist,
                    value: `${formatHours(t.msPlayed)}h`,
                    url: trackId ? `https://open.spotify.com/track/${trackId}` : `https://open.spotify.com/search/${encodeURIComponent(t.name + " " + t.artist)}`
                  };
                })}
                itemsByPlays={stats.topTracksByPlays.slice(0, 50).map(t => {
                   const trackId = t.uri ? t.uri.replace('spotify:track:', '') : '';
                   return {
                     id: `${t.name}-${t.artist}`,
                     title: t.name,
                     subtitle: t.artist,
                     value: `${t.count} plays`,
                     url: trackId ? `https://open.spotify.com/track/${trackId}` : `https://open.spotify.com/search/${encodeURIComponent(t.name + " " + t.artist)}`
                   };
                })}
              />
              <SkippedTracksList items={stats.skippedTracks} />
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-[500px]">
            <ArtistPieChart artists={stats.allArtists} totalMs={stats.totalMsPlayed} totalPlays={stats.totalPlays} />
          </div>
        </div>
      </div>


      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'artists'} 
        onClose={() => setActiveModal(null)} 
        title="All Discovered Artists"
      >
        <p className="text-zinc-400 mb-6 text-sm">Every single artist you've ever listened to, sorted by play time.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.allArtists.map((artist, i) => (
            <div key={`${artist.name}-${i}`} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-zinc-500 font-mono text-xs w-5 shrink-0">{i + 1}</span>
                <a 
                  href={`https://open.spotify.com/search/${encodeURIComponent(artist.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-200 font-medium truncate hover:text-green-400 transition-colors" 
                  title={artist.name}
                >
                  {artist.name}
                </a>
              </div>
              <span className="text-green-500/70 text-xs whitespace-nowrap ml-2">
                {Math.round(artist.msPlayed / (1000 * 60))} mins
              </span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'oneHitWonders'} 
        onClose={() => setActiveModal(null)} 
        title="Your One-Hit Wonders"
      >
        <p className="text-zinc-400 mb-6 text-sm">Artists you've listened to for at least 30 seconds, but exactly one time. True exploration!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stats.oneHitWonders.map((artist, i) => (
            <div key={`${artist.name}-${i}`} className="flex items-center p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <Ghost className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
              <a 
                href={`https://open.spotify.com/search/${encodeURIComponent(artist.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 text-sm truncate hover:text-green-400 transition-colors" 
                title={artist.name}
              >
                {artist.name}
              </a>
            </div>
          ))}
        </div>
      </Modal>

      <Modal 
        isOpen={showDiscoveryLog} 
        onClose={() => {
          setShowDiscoveryLog(false);
          setExpandedMonth(null);
        }} 
        title={expandedMonth ? `Discoveries in ${expandedMonth}` : "Artist Discovery Timeline"}
      >
        {!expandedMonth ? (
          <>
            <p className="text-zinc-400 mb-6 text-sm">Select a month to see who you discovered.</p>
            <div className="flex flex-col gap-2">
              {stats.discoveryByMonth.filter(m => m.newArtists > 0).map((monthData) => (
                <button
                  key={monthData.month}
                  onClick={() => setExpandedMonth(monthData.month)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/80 border border-zinc-700/50 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-zinc-200">{monthData.month}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 text-sm">{monthData.newArtists} artists</span>
                    <ChevronDown className="w-4 h-4 text-zinc-500 -rotate-90" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button 
              onClick={() => setExpandedMonth(null)}
              className="text-zinc-400 hover:text-white mb-6 flex items-center gap-2 transition-colors text-sm"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Back to Timeline
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.discoveryByMonth.find(m => m.month === expandedMonth)?.artists.map((artistName, i) => (
                <div key={`${artistName}-${i}`} className="flex items-center p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
                  <Compass className="w-4 h-4 text-purple-500 mr-3 shrink-0" />
                  <a 
                    href={`https://open.spotify.com/search/${encodeURIComponent(artistName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 font-medium truncate hover:text-purple-400 transition-colors" 
                    title={artistName}
                  >
                    {artistName}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
