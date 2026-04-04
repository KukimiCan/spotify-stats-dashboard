"use client";

import { useEffect, useState, useMemo } from "react";
import { RacingFrame } from "@/lib/types";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

interface BarChartRaceProps {
  frames: RacingFrame[];
}

const getStringHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};
const getColor = (id: string) => {
  const h = Math.abs(getStringHash(id)) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

export function BarChartRace({ frames }: BarChartRaceProps) {
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // null = アダプティブモード（自動速度調整）, 数値 = マニュアル固定速度
  const [manualSpeedMs, setManualSpeedMs] = useState<number | null>(null);
  const BASE_SPEED = 300; // アダプティブモードの基準速度（ms）

  // 全フレームを通して登場するすべての要素をユニークなリストとして抽出
  const allRacedItems = useMemo(() => {
    if (!frames || frames.length === 0) return [];
    const map = new Map<string, { id: string, name: string, subtitle?: string }>();
    frames.forEach(f => {
      f.data.forEach(d => {
        if (!map.has(d.id)) {
          map.set(d.id, { id: d.id, name: d.name, subtitle: d.subtitle });
        }
      });
    });
    return Array.from(map.values());
  }, [frames]);

  // データが安定した(トップ10曲以上が登場した)最初のフレームを開始点にする
  const stableStartIdx = useMemo(() => {
    if (!frames || frames.length === 0) return 0;
    const idx = frames.findIndex(f => f.data.length >= 10);
    return idx >= 0 ? idx : 0;
  }, [frames]);

  // フレーム間の変動量スコアを事前計算する（アダプティブ速度に利用）
  // スコア = 上位N件の中でランクが変わった件数 + 新規ランクイン件数
  const frameVolatilityScores = useMemo(() => {
    if (!frames || frames.length < 2) return [];
    const scores: number[] = [0]; // 最初のフレームはスコア0
    for (let i = 1; i < frames.length; i++) {
      const prev = new Map(frames[i - 1].data.map((d, idx) => [d.id, idx]));
      const curr = frames[i].data;
      let score = 0;
      const topValue = curr.length > 0 ? curr[0].value : 0;
      
      curr.forEach((d, currRank) => {
        const prevRank = prev.get(d.id);
        
        // トップ10以内での変動をカウントし、上位ほど重みを付ける（1位=1.0, 10位=0.1）
        if (currRank < 10 && (prevRank === undefined || prevRank !== currRank)) {
          const weight = (10 - currRank) / 10;
          score += weight;
        }
      });

      // 再生回数が少ない初期段階（トップが20回未満）は、変動スコアに減衰をかける
      // これにより「最初の方がやけに遅い」現象を回避する
      if (topValue < 20) {
        score *= (topValue / 20);
      }

      scores.push(score);
    }
    // 移動平均を適用してスコアを平滑化する（前後2フレームずつの合計5フレーム窓）
    const WINDOW_SIZE = 5;
    const half = Math.floor(WINDOW_SIZE / 2);
    const smoothedScores = scores.map((_, idx) => {
      let sum = 0;
      let count = 0;
      for (let j = idx - half; j <= idx + half; j++) {
        if (j >= 0 && j < scores.length) {
          sum += scores[j];
          count++;
        }
      }
      return sum / count;
    });

    // 0〜1の範囲に正規化する。
    // 分母の 1.5 は「一日に1.5個分相当（例: 1位と2位の交代など）の大きな動きがあれば十分に遅くする」という基準
    const NOMINAL_MAX_SCORE = 1.5;
    const maxSeenScore = Math.max(...smoothedScores, 1);
    const normalizationFactor = Math.max(maxSeenScore, NOMINAL_MAX_SCORE);
    
    return smoothedScores.map(s => s / normalizationFactor);
  }, [frames]);

  // 現フレームのスコアに応じた「目標」待機時間を計算する
  const getTargetSpeedMs = (frameIdx: number) => {
    if (manualSpeedMs !== null) return manualSpeedMs; // マニュアルモード
    const volatility = frameVolatilityScores[frameIdx] ?? 0;
    const curved = Math.pow(volatility, 2);
    return Math.round(10 + curved * 1990);
  };

  // 前回の値（バーの長さを急に0にせず、徐々に縮むよう記憶する）
  const [prevValues, setPrevValues] = useState<Map<string, number>>(new Map());

  // フレームリストが変わったときの初期化
  useEffect(() => {
    setCurrentFrameIdx(stableStartIdx);
    setIsPlaying(false);
    setPrevValues(new Map());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, stableStartIdx]);

  // 再生ループ
  useEffect(() => {
    if (!isPlaying || !frames || frames.length === 0) return;
    if (currentFrameIdx >= frames.length - 1) {
      setIsPlaying(false);
      return;
    }
    // 次のフレームでの変動量に応じて待機時間を決める（「次で大きな変化がある→今ゆっくり待つ」）
    const waitMs = getTargetSpeedMs(Math.min(currentFrameIdx + 1, frames.length - 1));
    const timer = setTimeout(() => {
      const currData = frames[currentFrameIdx]?.data;
      if (currData) {
        const newMap = new Map(prevValues);
        currData.forEach(d => newMap.set(d.id, d.value));
        setPrevValues(newMap);
      }
      setCurrentFrameIdx(prev => Math.min(prev + 1, frames.length - 1));
    }, waitMs);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrameIdx, isPlaying, manualSpeedMs, frames, prevValues, frameVolatilityScores]);

  if (!frames || frames.length === 0) {
    return <div className="text-zinc-500 py-10 text-center">No race data available.</div>;
  }

  const currentFrame = frames[currentFrameIdx] || frames[0];
  const maxVal = Math.max(...currentFrame.data.map(d => d.value), 1);
  const numItems = currentFrame.data.length;
  const itemHeight = 36;
  const gap = 12;

  // CSS transition は長めの固定値にして中断しない（速度変化はsetTimeoutの間隔で制御）
  const TRANSITION_MS = 600;

  // 現在のフレームに存在する要素の辞書をつくり、O(1)で検索できるようにする
  const currentStatusMap = new Map(currentFrame.data.map((d, index) => [d.id, { ...d, rank: index }]));

  return (
    <div className="flex flex-col h-full w-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4 shrink-0 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg relative z-50">
        <div>
          <h2 className="text-3xl font-bold font-mono text-white tracking-widest">
            {currentFrame.date.includes(' ') ? `${currentFrame.date}:00` : currentFrame.date}
          </h2>
          <p className="text-zinc-500 text-sm">Top {numItems} by total plays</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setIsPlaying(false); setCurrentFrameIdx(prev => Math.max(prev - 1, stableStartIdx)); }} 
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors"
            title="Step back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="p-3 bg-green-500 hover:bg-green-400 text-black rounded-full transition-colors shadow-lg shadow-green-500/20 mx-1"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => { setIsPlaying(false); setCurrentFrameIdx(prev => Math.min(prev + 1, frames.length - 1)); }} 
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors"
            title="Step forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-zinc-700 mx-1"></div>

          <select
            value={manualSpeedMs === null ? 'auto' : String(manualSpeedMs)}
            onChange={(e) => {
              const val = e.target.value;
              setManualSpeedMs(val === 'auto' ? null : Number(val));
            }}
            className="px-3 py-1.5 rounded-md text-sm font-bold font-mono border cursor-pointer
              bg-zinc-900 border-zinc-700 text-white hover:border-zinc-500 transition-colors outline-none"
            style={manualSpeedMs === null ? { color: '#c084fc', borderColor: '#7e22ce' } : {}}
          >
            <option value="auto">🤖 Auto</option>
            <option value="600">0.5x</option>
            <option value="300">1x</option>
            <option value="150">2x</option>
            <option value="80">4x</option>
            <option value="30">10x</option>
            <option value="10">30x</option>
          </select>
        </div>
      </div>

      <input 
        type="range"
        min={stableStartIdx}
        max={frames.length > 0 ? frames.length - 1 : 0}
        value={currentFrameIdx}
        onChange={(e) => {
          setIsPlaying(false);
          setCurrentFrameIdx(Number(e.target.value));
        }}
        className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none z-50 mb-6"
        style={{
          background: `linear-gradient(to right, #22c55e ${((currentFrameIdx - stableStartIdx) / Math.max(frames.length - 1 - stableStartIdx, 1)) * 100}%, #27272a ${((currentFrameIdx - stableStartIdx) / Math.max(frames.length - 1 - stableStartIdx, 1)) * 100}%)`,
        }}
      />

      <div className="relative flex-1 overflow-hidden" style={{ height: numItems * (itemHeight + gap) }}>
        {allRacedItems.map((item) => {
          const currentStatus = currentStatusMap.get(item.id);
          const isOut = !currentStatus;
          
          // 圏外の場合は「一番下」＋「opacity: 0」。圏内の場合はその順位。
          const rank = isOut ? numItems + 1 : currentStatus.rank;
          const posTop = rank * (itemHeight + gap);
          
          // 値がない場合は直前のフレームの値を参照して自然に縮むようにする
          const value = currentStatus ? currentStatus.value : (prevValues.get(item.id) || 0);
          const widthPct = Math.max((value / maxVal) * 100, 1);
          
          // 順位が高いほど前に、圏外は奥へ
          const zIndex = isOut ? 0 : 100 - rank;

          return (
            <div 
              key={item.id}
              className="absolute left-0 right-0 flex items-center"
            style={{ 
                top: 0,
                transform: `translateY(${posTop}px)`,
                height: `${itemHeight}px`,
                opacity: isOut ? 0 : 1,
                zIndex: zIndex,
                pointerEvents: isOut ? 'none' : 'auto',
                transition: `transform ${TRANSITION_MS + 50}ms ease-in-out, opacity ${TRANSITION_MS}ms ease-in-out`
              }}
            >
              <div 
                className="w-8 shrink-0 flex items-center justify-center text-zinc-500 font-mono font-bold text-sm" 
                style={{ transition: `all ${TRANSITION_MS}ms linear`, opacity: isOut ? 0 : 1 }}
              >
                {!isOut ? rank + 1 : ''}
              </div>
              
              <div className="flex-1 relative h-full group">
                <div 
                  className="absolute left-0 top-0 bottom-0 rounded-r-md opacity-90 shadow-md"
                  style={{ 
                    width: isOut ? '0%' : `${widthPct}%`,
                    backgroundColor: getColor(item.id),
                    transition: `width ${TRANSITION_MS + 50}ms ease-in-out, background-color ${TRANSITION_MS}ms linear`
                  }}
                />
                <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 z-10 w-full overflow-hidden">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-white font-bold text-[13px] truncate whitespace-nowrap drop-shadow-md">
                      {item.name}
                    </span>
                    {item.subtitle && (
                      <span className="text-white/70 text-[10px] truncate whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div 
                className="shrink-0 w-20 text-right font-mono font-bold text-sm" 
                style={{ color: getColor(item.id), transition: `color ${TRANSITION_MS}ms linear`, opacity: isOut ? 0 : 1 }}
              >
                {value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
