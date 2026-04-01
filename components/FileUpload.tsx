"use client";

import { UploadCloud } from 'lucide-react';
import { useCallback } from 'react';
import { SpotifyHistoryItem } from '@/lib/types';

interface FileUploadProps {
  onDataLoaded: (data: SpotifyHistoryItem[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const filePromises = Array.from(files).map((file) => {
        return new Promise<SpotifyHistoryItem[]>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              const json = JSON.parse(text);
              resolve(json);
            } catch (error) {
              console.error("Failed to parse JSON file", file.name, error);
              reject(error);
            }
          };
          reader.readAsText(file);
        });
      });

      Promise.all(filePromises).then((results) => {
        // Flatten array of arrays
        const combinedData = results.flat();
        onDataLoaded(combinedData);
      }).catch(err => {
        alert("Some files could not be parsed as valid JSON.");
      });
    },
    [onDataLoaded]
  );

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-2xl p-12 text-center hover:bg-zinc-900/50 transition-colors cursor-pointer relative group">
      <input 
        type="file" 
        multiple 
        accept=".json" 
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="bg-green-500/10 p-4 rounded-full mb-4 group-hover:bg-green-500/20 transition-colors">
        <UploadCloud className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Upload your Spotify Data</h3>
      <p className="text-zinc-400 max-w-md">
        Select one or more <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">StreamingHistory.json</code> files to generate your dashboard. All data is processed locally in your browser.
      </p>
    </div>
  );
}
