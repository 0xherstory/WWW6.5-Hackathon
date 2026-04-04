import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, X } from 'lucide-react';

/**
 * 音乐播放器组件 - 完全独立，零侵入
 * 使用方式：在 App.jsx 中添加 <MusicPlayer /> 即可
 */
const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // 本地音乐列表 - Lo-Fi Chill Music
  const playlist = [
    {
      title: 'Summer Boulevard',
      artist: 'Bransboynd',
      url: '/music/bransboynd-summer-boulevard.mp3',
      cover: '🌴'
    },
    {
      title: 'Good Night',
      artist: 'FASSounds',
      url: '/music/fassounds-good-night-lofi-cozy-chill-music.mp3',
      cover: '🌙'
    },
    {
      title: 'Lofi Study',
      artist: 'FASSounds',
      url: '/music/fassounds-lofi-study-calm-peaceful-chill-hop.mp3',
      cover: '📚'
    },
    {
      title: 'Honey',
      artist: 'snoozybeats',
      url: '/music/snoozybeats-honey-chill-lofi.mp3',
      cover: '🍯'
    },
    {
      title: 'Walking Dreaming',
      artist: 'snoozybeats',
      url: '/music/snoozybeats-walking-dreaming-chill-lofi.mp3',
      cover: '🚶'
    }
  ];

  const currentTrack = playlist[currentTrackIndex];

  // 播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  // 上一首
  const prevTrack = () => {
    const newIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(newIndex);
    setProgress(0);
    setCurrentTime(0);
  };

  // 下一首
  const nextTrack = () => {
    const newIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(newIndex);
    setProgress(0);
    setCurrentTime(0);
  };

  // 静音切换
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // 音量调整
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 进度调整
  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && duration) {
      const newTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 时间格式化
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  // 切换歌曲时自动播放
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <>
      {/* 隐藏的音频元素 */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        preload="metadata"
      />

      {/* 播放器主体 */}
      <div className="fixed bottom-4 right-4 z-40">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            // 展开状态 - 完整播放器
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="w-72 bg-slate-800/95 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-3 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">音乐播放器</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-purple-500/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* 封面和信息 */}
              <div className="p-4 text-center">
                <div className="text-5xl mb-3">{currentTrack.cover}</div>
                <h3 className="font-medium text-white truncate">{currentTrack.title}</h3>
                <p className="text-sm text-slate-400 truncate">{currentTrack.artist}</p>
              </div>

              {/* 进度条 */}
              <div className="px-4 pb-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-purple-500
                    [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center justify-center gap-4 p-3">
                <button
                  onClick={prevTrack}
                  className="p-2 hover:bg-purple-500/20 rounded-full transition-colors"
                >
                  <SkipBack className="w-5 h-5 text-slate-300" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-3 bg-purple-500 hover:bg-purple-600 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={nextTrack}
                  className="p-2 hover:bg-purple-500/20 rounded-full transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-slate-300" />
                </button>
              </div>

              {/* 音量控制 */}
              <div className="flex items-center gap-2 px-4 pb-4">
                <button onClick={toggleMute} className="p-1">
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-2.5
                    [&::-webkit-slider-thumb]:h-2.5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-purple-400
                    [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

              {/* 播放列表 */}
              <div className="border-t border-purple-500/20 max-h-32 overflow-y-auto">
                {playlist.map((track, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentTrackIndex(index);
                      setProgress(0);
                      setCurrentTime(0);
                    }}
                    className={`w-full flex items-center gap-3 p-2 px-4 hover:bg-purple-500/10 transition-colors text-left
                      ${index === currentTrackIndex ? 'bg-purple-500/20' : ''}`}
                  >
                    <span className="text-lg">{track.cover}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{track.title}</div>
                      <div className="text-xs text-slate-500 truncate">{track.artist}</div>
                    </div>
                    {index === currentTrackIndex && isPlaying && (
                      <div className="flex gap-0.5">
                        <span className="w-0.5 h-3 bg-purple-400 animate-pulse" />
                        <span className="w-0.5 h-3 bg-purple-400 animate-pulse delay-75" />
                        <span className="w-0.5 h-3 bg-purple-400 animate-pulse delay-150" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            // 收起状态 - 迷你按钮
            <motion.button
              key="mini"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800/90 backdrop-blur-sm border border-purple-500/30 rounded-full shadow-lg hover:border-purple-500/50 transition-all group"
            >
              <div className="relative">
                <Music className="w-5 h-5 text-purple-400" />
                {isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                  />
                )}
              </div>
              <span className="text-sm text-slate-300 max-w-24 truncate">
                {isPlaying ? currentTrack.title : '播放音乐'}
              </span>
              {isPlaying && (
                <div className="flex gap-0.5">
                  <motion.span
                    animate={{ height: [4, 12, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-1 bg-purple-400 rounded-full"
                  />
                  <motion.span
                    animate={{ height: [4, 8, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                    className="w-1 bg-purple-400 rounded-full"
                  />
                  <motion.span
                    animate={{ height: [4, 10, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                    className="w-1 bg-purple-400 rounded-full"
                  />
                </div>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MusicPlayer;
