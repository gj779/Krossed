import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2 } from "lucide-react";

interface VoiceMessagePlayerProps {
  voiceUrl: string;
  duration: number;
  isFromCurrentUser: boolean;
  timestamp: Date;
}

export function VoiceMessagePlayer({ 
  voiceUrl, 
  duration, 
  isFromCurrentUser,
  timestamp 
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      console.error('Error loading voice message');
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [voiceUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg max-w-sm ${
        isFromCurrentUser 
          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white ml-auto' 
          : 'bg-gray-100 text-gray-900'
      }`}
      data-testid="voice-message"
    >
      <audio
        ref={audioRef}
        src={voiceUrl}
        preload="metadata"
        className="hidden"
      />

      {/* Play button */}
      <Button
        onClick={togglePlay}
        disabled={isLoading}
        variant="ghost"
        size="sm"
        className={`rounded-full w-8 h-8 p-0 ${
          isFromCurrentUser 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
        data-testid="button-play-voice-message"
      >
        {isLoading ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3 ml-0.5" />
        )}
      </Button>

      {/* Waveform and progress */}
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <Volume2 className="w-3 h-3 opacity-70" />
          <div 
            className={`flex-1 h-1 rounded-full overflow-hidden ${
              isFromCurrentUser ? 'bg-white/30' : 'bg-gray-300'
            }`}
          >
            <div 
              className={`h-full transition-all duration-300 ${
                isFromCurrentUser ? 'bg-white' : 'bg-pink-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Time display */}
        <div className="flex justify-between text-xs opacity-70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Timestamp (for non-current user messages) */}
      {!isFromCurrentUser && (
        <div className="text-xs opacity-70">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}