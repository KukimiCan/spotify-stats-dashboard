import { AlertTriangle } from 'lucide-react';

interface SkippedTrack {
  name: string;
  artist: string;
  skipRatio: number;
  totalPlays: number;
  uri: string | null;
}

interface SkippedTracksListProps {
  items: SkippedTrack[];
}

export function SkippedTracksList({ items }: SkippedTracksListProps) {
  return (
    <div className="bg-zinc-900 bg-opacity-70 border border-red-900/30 rounded-xl p-6 flex flex-col gap-4 shadow-lg backdrop-blur-sm h-[460px]">
      <div className="flex justify-between items-start mb-2 shrink-0">
         <div className="flex items-center gap-2">
           <AlertTriangle className="w-5 h-5 text-red-500" />
           <h3 className="text-red-400 font-semibold text-lg">Most Skipped Tracks</h3>
         </div>
         <span className="text-xs text-zinc-500 max-w-[200px] text-right">
           Songs you play but skip constantly (minimum 10 plays)
         </span>
      </div>
      
      <ul className="flex flex-col gap-3 overflow-y-auto pr-2 pb-2 custom-scrollbar">
        {items.map((item, index) => (
          <li key={`${item.name}-${item.artist}`} className="flex items-center gap-4 group">
            <span className="text-red-900 font-mono w-6 text-right group-hover:text-red-500 transition-colors">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              {item.uri ? (
                <a 
                  href={`https://open.spotify.com/track/${item.uri.replace('spotify:track:', '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-200 font-medium truncate hover:text-green-400 transition-colors block"
                >
                  {item.name}
                </a>
              ) : (
                <p className="text-zinc-200 font-medium truncate">{item.name}</p>
              )}
              <a 
                href={`https://open.spotify.com/search/${encodeURIComponent(item.artist)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-500 text-sm truncate hover:text-green-400 transition-colors block"
              >
                {item.artist}
              </a>
            </div>
            <div className="text-right whitespace-nowrap">
              <div className="text-red-400 font-medium">{Math.round(item.skipRatio * 100)}% skipped</div>
              <div className="text-zinc-600 text-xs">{item.totalPlays} total plays</div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-zinc-500 text-sm text-center py-4">
            No consistently skipped tracks found!
          </li>
        )}
      </ul>
    </div>
  );
}
